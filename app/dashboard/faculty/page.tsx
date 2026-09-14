import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

import {
  GraduationCap,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  FileCheck,
} from "lucide-react";

export default async function FacultyDashboardPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/faculty");
  }

  if (profile?.role !== "faculty_coordinator" && profile?.role !== "admin") {
    redirect("/unauthorized");
  }

  const supabase = await createSupabaseServerClient();
  let assignedClubs: any[] = [];
  let clubEvents: any[] = [];

  if (supabase) {
    // Fetch clubs where faculty_coordinator_id is user.id (or all clubs if admin)
    let query = supabase.from("clubs").select(`
      *,
      organization:organizations(*),
      members:club_members(id)
    `);

    if (profile.role !== "admin") {
      query = query.eq("faculty_coordinator_id", user.id);
    }

    const { data: clubs } = await query;
    if (clubs && clubs.length > 0) {
      assignedClubs = clubs;
      const cIds = assignedClubs.map((c) => c.id);

      const { data: events } = await supabase
        .from("events")
        .select("*, club:clubs(name, slug)")
        .in("club_id", cIds)
        .order("event_date", { ascending: false });

      if (events) clubEvents = events;
    }
  }

  const role = profile?.role || "faculty_coordinator";
  const roleBadge = getRoleBadgeClass(role);
  const roleLabel = getRoleLabel(role);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Faculty Advisory Portal
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Department: <strong className="text-slate-700">{profile?.department || "Academic Affairs"}</strong> • Faculty Coordinator: <strong className="text-slate-700">{profile?.full_name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-100">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Academic compliance & club oversight</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Advised Clubs</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {assignedClubs.length}
          </div>
          <div className="text-[11px] text-slate-500">Organizations in your department</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Advised Club Events</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {clubEvents.length}
          </div>
          <div className="text-[11px] text-slate-500">Approved & scheduled activities</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Total Student Members</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {assignedClubs.reduce((acc, c) => acc + (c.members?.length || 0), 0)}
          </div>
          <div className="text-[11px] text-slate-500">Students participating</div>
        </div>
      </div>

      {/* Advised Clubs Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          <span>Advised Student Organizations</span>
        </h2>

        {assignedClubs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No clubs currently assigned to your profile</p>
            <p className="text-xs text-slate-500">
              Campus administration assigns faculty coordinators when clubs renew their annual charter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {club.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {club.members?.length || 0} Members
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{club.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{club.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Charter Active
                  </span>
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <span>Inspect Club</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advised Club Events */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Club Event Calendar & Activity Log</span>
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {clubEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No events currently scheduled for your advised clubs.
              </div>
            ) : (
              clubEvents.map((evt) => {
                const dateFormatted = new Date(evt.event_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div key={evt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{evt.title}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {evt.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {evt.club?.name} • Venue: {evt.venue} • Date: {dateFormatted}
                      </div>
                    </div>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
                    >
                      <span>Event Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
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
