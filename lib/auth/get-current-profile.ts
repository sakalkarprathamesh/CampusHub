import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Profile, ClubMemberWithProfile, MembershipRequestWithDetails, Club } from "@/types/database";

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

    // Fetch profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // If profile doesn't exist yet (e.g. newly signed up before trigger), create fallback or insert
    if (!profile && !profileError) {
      const fallbackName = user.user_metadata?.full_name || user.email.split("@")[0];
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: fallbackName,
          role: "student",
        })
        .select("*")
        .maybeSingle();

      profile = newProfile;
    }

    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split("@")[0],
        avatar_url: null,
        department: null,
        year_of_study: null,
        bio: null,
        phone: null,
        skills: [],
        interests: [],
        role: "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

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
    if (profile.role === "faculty_coordinator") {
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

    // If admin, they have oversight over all clubs
    // Fetch pending requests for this user
    let pendingRequests: MembershipRequestWithDetails[] = [];
    try {
      const { data: pData } = await supabase
        .from("membership_requests")
        .select(`
          *,
          club:clubs (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (pData) pendingRequests = pData as MembershipRequestWithDetails[];
    } catch {
      // safe fallback
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
