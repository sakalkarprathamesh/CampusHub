import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStatistics, getClubs, getAllEventsForAdmin, getAdminActivityLogs } from "@/lib/data";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import { SEED_PROFILES } from "@/lib/data/seed-data";
import AdminDashboardTabs from "@/components/dashboard/AdminDashboardTabs";
import { AdminMembershipRequest } from "@/components/dashboard/AdminMembershipManager";
import { Event, Club, Profile, AdminActivityLog } from "@/types/database";
import { ShieldAlert, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/admin");
  }

  if (profile?.role !== "admin") {
    redirect("/unauthorized");
  }

  const supabase = await createSupabaseServerClient();
  const stats = await getStatistics();
  const allClubs = await getClubs();
  const allEvents = await getAllEventsForAdmin();
  const allLogs = await getAdminActivityLogs(40);

  // Fetch all profiles
  let allProfiles: Profile[] = [];
  let allMembershipRequests: AdminMembershipRequest[] = [];

  if (supabase) {
    try {
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profs && profs.length > 0) allProfiles = profs;
    } catch {}

    try {
      const { data: reqData } = await supabase
        .from("membership_requests")
        .select(`
          id,
          club_id,
          user_id,
          status,
          message,
          rejection_reason,
          created_at,
          applicant:profiles!membership_requests_user_id_fkey (
            id,
            full_name,
            email,
            department
          ),
          club:clubs!membership_requests_club_id_fkey (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (reqData && reqData.length > 0) {
        allMembershipRequests = reqData as unknown as AdminMembershipRequest[];
      }
    } catch {}
  }

  if (allProfiles.length === 0) {
    allProfiles = SEED_PROFILES as Profile[];
  }

  const roleBadge = getRoleBadgeClass("admin");
  const roleLabel = getRoleLabel("admin");

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Campus Administration
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Logged in as <strong className="text-slate-700">{profile?.full_name}</strong> ({profile?.email}) • Full platform access & role management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200/80">
          <Lock className="w-4 h-4 text-red-600" />
          <span>Restricted Admin Console</span>
        </div>
      </div>

      {/* Main Admin Tabbed Console */}
      <AdminDashboardTabs
        clubs={allClubs}
        events={allEvents}
        profiles={allProfiles}
        requests={allMembershipRequests}
        logs={allLogs}
        currentAdminId={user.id}
        stats={stats}
      />
    </div>
  );
}
