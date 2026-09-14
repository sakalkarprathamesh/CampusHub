import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Profile, ClubMemberWithProfile, MembershipRequestWithDetails, Club } from "@/types/database";
import { MEM_MEMBERSHIP_REQUESTS } from "@/lib/data";
import { SEED_CLUBS } from "@/lib/data/seed-data";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";

export interface CurrentUserContext {
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;
  memberships: Array<{
    id: string;
    club_id: string;
    role: string;
    status: string;
    club: Club;
  }>;
  ledClubs: Club[];
  pendingRequests: MembershipRequestWithDetails[];
  unreadNotificationsCount: number;
}

export async function getCurrentProfile(): Promise<CurrentUserContext> {
  const emptyContext: CurrentUserContext = {
    user: null,
    profile: null,
    memberships: [],
    ledClubs: [],
    pendingRequests: [],
    unreadNotificationsCount: 0,
  };

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return emptyContext;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return emptyContext;
    }

    // Ensure profile exists for authenticated user
    const profile = await ensureUserProfile(supabase, user);

    // Fetch user's club memberships
    let memberships: any[] = [];
    try {
      const { data: mData } = await supabase
        .from("club_members")
        .select(`
          id,
          club_id,
          role,
          status,
          club:clubs (*)
        `)
        .eq("profile_id", user.id)
        .eq("status", "active");

      if (mData) memberships = mData;
    } catch {
      // safe fallback if table unavailable
    }

    // Determine clubs led by this user
    const ledClubs: Club[] = [];
    memberships.forEach((m) => {
      if (
        (m.role === "president" || m.role === "vice_president" || profile?.role === "club_lead") &&
        m.club
      ) {
        ledClubs.push(m.club);
      }
    });

    // If faculty coordinator, fetch clubs assigned to them
    if (profile?.role === "faculty_coordinator") {
      try {
        const { data: fClubs } = await supabase
          .from("clubs")
          .select("*")
          .eq("faculty_coordinator_id", user.id);

        if (fClubs) {
          fClubs.forEach((fc) => {
            if (!ledClubs.some((c) => c.id === fc.id)) {
              ledClubs.push(fc);
            }
          });
        }
      } catch {
        // safe fallback
      }
    }

    // Fetch pending requests for this user
    let pendingRequests: MembershipRequestWithDetails[] = [];
    try {
      const { data: pData } = await supabase
        .from("membership_requests")
        .select(`
          *,
          club:clubs (*)
        `)
        .or(`user_id.eq.${user.id},student_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (pData && pData.length > 0) {
        pendingRequests = pData as MembershipRequestWithDetails[];
      }
    } catch {
      // safe fallback
    }

    if (pendingRequests.length === 0) {
      const memReqs = MEM_MEMBERSHIP_REQUESTS.filter(
        (r) => r.user_id === user.id || r.student_id === user.id
      );
      if (memReqs.length > 0) {
        pendingRequests = memReqs.map((r) => {
          const club = SEED_CLUBS.find((c) => c.id === r.club_id);
          return {
            ...r,
            club,
          } as unknown as MembershipRequestWithDetails;
        });
      }
    }

    // Unread notifications count
    let unreadCount = 0;
    try {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("is_read", false);

      if (count !== null && count !== undefined) {
        unreadCount = count;
      }
    } catch {
      // safe fallback
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile as Profile,
      memberships,
      ledClubs,
      pendingRequests,
      unreadNotificationsCount: unreadCount,
    };
  } catch (error) {
    console.error("Error in getCurrentProfile:", error);
    return emptyContext;
  }
}
