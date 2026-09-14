import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStatistics, getClubs } from "@/lib/data";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import AdminUserRoleManager from "@/components/dashboard/AdminUserRoleManager";

export const dynamic = "force-dynamic";

import {
  ShieldAlert,
  Users,
  Building,
  Calendar,
  Layers,
  ExternalLink,
  CheckCircle2,
  Lock,
} from "lucide-react";

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

  // Fetch all profiles
  let allProfiles: any[] = [];
  let pendingRequestsCount = 0;

  if (supabase) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profs) allProfiles = profs;

    const { count } = await supabase
      .from("membership_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    pendingRequestsCount = count || 0;
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
          <span>Restricted Admin Surface</span>
        </div>
      </div>

      {/* Platform-Wide Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Total Profiles</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {allProfiles.length || stats.totalMembers}
          </div>
          <div className="text-[11px] text-slate-500">Registered users</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Clubs</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.totalClubs}
          </div>
          <div className="text-[11px] text-slate-500">Active organizations</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Organizations</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.totalOrganizations}
          </div>
          <div className="text-[11px] text-slate-500">College branches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Published Events</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.upcomingEventsCount}
          </div>
          <div className="text-[11px] text-slate-500">Campus calendar</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Pending Requests</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {pendingRequestsCount}
          </div>
          <div className="text-[11px] text-slate-500">Campus-wide requests</div>
        </div>
      </div>

      {/* Admin User Role Manager */}
      <AdminUserRoleManager
        initialUsers={allProfiles}
        currentAdminId={user.id}
      />

      {/* College Club Directory Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Campus Clubs Registry</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{allClubs.length} Active Clubs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4">Club Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Charter Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allClubs.map((club) => (
                <tr key={club.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{club.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium">
                      {club.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Charter
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
