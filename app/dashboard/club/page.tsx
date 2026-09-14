import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import ClubLeadRequestsManager, { ClubLeadRequest } from "@/components/dashboard/ClubLeadRequestsManager";

export const dynamic = "force-dynamic";

import {
  Users,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  Building,
} from "lucide-react";

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
    if (allClubs) managedClubs = allClubs;
  }

  const primaryClub = managedClubs[0];
  const clubIds = managedClubs.map((c) => c.id);

  // Fetch pending requests for managed clubs
  let pendingRequests: ClubLeadRequest[] = [];
  let membersList: any[] = [];
  let eventsCount = 0;
  let teamsCount = 0;

  if (supabase && clubIds.length > 0) {
    // 1. Pending membership requests
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

    // 2. Members list
    const { data: memData } = await supabase
      .from("club_members")
      .select(`
        id,
        role,
        status,
        joined_at,
        profile:profiles (*)
      `)
      .in("club_id", clubIds)
      .eq("status", "active")
      .order("role");

    if (memData) {
      membersList = memData;
    }

    // 3. Events count
    const { count: eCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .in("club_id", clubIds);
    eventsCount = eCount || 0;

    // 4. Teams count
    const { count: tCount } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
      .in("club_id", clubIds);
    teamsCount = tCount || 0;
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
                {managedClubs.map((c) => c.name).join(", ") || "ACM Student Chapter"}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Club Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {membersList.length}
          </div>
          <div className="text-[11px] text-slate-500">Active roster members</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Pending Applicants</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-500">Require officer approval</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Active Teams</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {teamsCount}
          </div>
          <div className="text-[11px] text-slate-500">Sub-teams & committees</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Scheduled Events</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {eventsCount}
          </div>
          <div className="text-[11px] text-slate-500">Club events in calendar</div>
        </div>
      </div>

      {/* Main Grid: Pending Applications & Active Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Membership Applications ({pendingRequests.length})</span>
            </h2>
            <span className="text-xs text-slate-500">
              Review and click Approve to add to active roster
            </span>
          </div>

          <ClubLeadRequestsManager initialRequests={pendingRequests} />
        </div>

        {/* Members Roster Column (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Active Roster</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {membersList.length} Total
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 max-h-[600px] overflow-y-auto">
            {membersList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No members found in this roster.
              </p>
            ) : (
              membersList.map((m) => {
                const name = m.profile?.full_name || "Club Member";
                const email = m.profile?.email || "";
                const dept = m.profile?.department || "Student";
                const roleFormatted = m.role.replace("_", " ");

                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-800 truncate">{name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{dept}</div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 flex-shrink-0">
                      {roleFormatted}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
