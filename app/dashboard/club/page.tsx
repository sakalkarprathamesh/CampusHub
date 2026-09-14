import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import { getAnnouncementsForClub } from "@/lib/data";
import { SEED_CLUBS, SEED_EVENTS } from "@/lib/data/seed-data";
import { ClubLeadRequest } from "@/components/dashboard/ClubLeadRequestsManager";
import { ClubMemberItem } from "@/components/dashboard/ClubLeadMembersManager";
import ClubLeadDashboardTabs from "@/components/dashboard/ClubLeadDashboardTabs";
import { Award, ExternalLink } from "lucide-react";
import { Event, Announcement, Club } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ClubDashboardPage() {
  const { user, profile, ledClubs } = await getCurrentProfile();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/club");
  }

  // Ensure user has club_lead or admin permissions
  if (profile?.role !== "club_lead" && profile?.role !== "admin" && ledClubs.length === 0) {
    redirect("/unauthorized");
  }

  const supabase = await createSupabaseServerClient();
  let managedClubs = ledClubs;

  // If user is club_lead or admin but ledClubs was empty, fetch first available clubs
  if (managedClubs.length === 0 && supabase) {
    const { data: allClubs } = await supabase.from("clubs").select("*").limit(2);
    if (allClubs && allClubs.length > 0) managedClubs = allClubs;
  }

  if (managedClubs.length === 0) {
    managedClubs = (SEED_CLUBS as Club[]).slice(0, 2);
  }

  const primaryClub = managedClubs[0];
  const clubIds = managedClubs.map((c) => c.id);

  // Fetch pending requests for managed clubs
  let pendingRequests: ClubLeadRequest[] = [];
  let membersList: ClubMemberItem[] = [];
  let eventsList: Event[] = [];
  let announcementsList: Announcement[] = [];
  let teamsCount = 0;

  if (supabase && clubIds.length > 0) {
    // 1. Pending membership requests
    try {
      const { data: reqData } = await supabase
        .from("membership_requests")
        .select(`
          id,
          club_id,
          status,
          message,
          created_at,
          applicant:profiles!membership_requests_user_id_fkey (
            id,
            full_name,
            email,
            department,
            year_of_study,
            bio,
            skills
          ),
          club:clubs!membership_requests_club_id_fkey (
            id,
            name
          )
        `)
        .in("club_id", clubIds)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (reqData) {
        pendingRequests = reqData.map((r: any) => ({
          id: r.id,
          club_id: r.club_id,
          status: r.status,
          message: r.message,
          created_at: r.created_at,
          applicant: r.applicant || {
            id: "unknown",
            full_name: "Student Applicant",
            email: "student@campushub.edu",
            department: null,
            year_of_study: null,
          },
          club: r.club || { id: r.club_id, name: "Managed Club" },
        }));
      }
    } catch {}

    // 2. Members list
    try {
      const { data: memData } = await supabase
        .from("club_members")
        .select(`
          id,
          club_id,
          profile_id,
          role,
          status,
          joined_at,
          profile:profiles (*)
        `)
        .in("club_id", clubIds)
        .eq("status", "active")
        .order("role");

      if (memData) {
        membersList = memData as unknown as ClubMemberItem[];
      }
    } catch {}

    // 3. Events list
    try {
      const { data: eData } = await supabase
        .from("events")
        .select(`
          *,
          club:clubs (
            id,
            name,
            slug
          )
        `)
        .in("club_id", clubIds)
        .order("event_date", { ascending: false });

      if (eData && eData.length > 0) {
        eventsList = eData as Event[];
      }
    } catch {}

    // 4. Teams count
    try {
      const { count: tCount } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true })
        .in("club_id", clubIds);
      teamsCount = tCount || 0;
    } catch {}
  }

  // Fallback events if database had none
  if (eventsList.length === 0) {
    eventsList = (SEED_EVENTS as Event[]).filter((e) => clubIds.includes(e.club_id));
  }

  // Fetch announcements
  if (primaryClub) {
    try {
      announcementsList = await getAnnouncementsForClub(primaryClub.id);
    } catch {
      announcementsList = [];
    }
  }

  const role = profile?.role || "club_lead";
  const roleBadge = getRoleBadgeClass(role);
  const roleLabel = getRoleLabel(role);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Club Leadership Console
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Managing:{" "}
              <strong className="text-slate-800">
                {managedClubs.map((c) => c.name).join(", ") || "Student Chapter"}
              </strong>
            </p>
          </div>
        </div>

        {primaryClub && (
          <Link
            href={`/clubs/${primaryClub.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition"
          >
            <span>Public Club Page</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Main Tabbed Console */}
      <ClubLeadDashboardTabs
        pendingRequests={pendingRequests}
        membersList={membersList}
        eventsList={eventsList}
        announcementsList={announcementsList}
        managedClubs={managedClubs}
        primaryClub={primaryClub}
        currentUserId={user.id}
        teamsCount={teamsCount}
      />
    </div>
  );
}
