import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import { getPendingEventsForFaculty } from "@/lib/data";
import { SEED_CLUBS, SEED_EVENTS } from "@/lib/data/seed-data";
import FacultyApprovalManager from "@/components/dashboard/FacultyApprovalManager";
import { Event, Club } from "@/types/database";

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
  Mail,
  UserCheck,
  Clock,
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
  let clubEvents: Event[] = [];
  let pendingEvents: Event[] = [];

  const isAdmin = profile?.role === "admin";

  if (supabase) {
    // 1. Fetch clubs advised by this faculty coordinator
    let query = supabase.from("clubs").select(`
      *,
      organization:organizations(*),
      members:club_members(
        id,
        role,
        profile:profiles(id, full_name, email, phone)
      )
    `);

    if (!isAdmin) {
      query = query.eq("faculty_coordinator_id", user.id);
    }

    const { data: clubs } = await query;
    if (clubs && clubs.length > 0) {
      assignedClubs = clubs;
    }

    // 2. Fetch pending events
    try {
      pendingEvents = await getPendingEventsForFaculty(user.id, isAdmin);
    } catch {
      pendingEvents = [];
    }

    // 3. Fetch approved/published events for advised clubs
    const cIds = assignedClubs.map((c) => c.id);
    if (cIds.length > 0) {
      const { data: events } = await supabase
        .from("events")
        .select("*, club:clubs(name, slug)")
        .in("club_id", cIds)
        .order("event_date", { ascending: false });

      if (events) clubEvents = events;
    }
  }

  // Prototype / seed fallback if empty
  if (assignedClubs.length === 0) {
    assignedClubs = (SEED_CLUBS as any[]).slice(0, 3).map((c) => ({
      ...c,
      members: [
        {
          id: "m1",
          role: "president",
          profile: {
            id: "p1",
            full_name: "Rahul Verma",
            email: "rahul.verma@mituniversity.edu.in",
          },
        },
      ],
    }));
  }

  if (pendingEvents.length === 0 && clubEvents.length === 0) {
    clubEvents = (SEED_EVENTS as Event[]).slice(0, 3);
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
              Department: <strong className="text-slate-700">{profile?.department || "School of Computing"}</strong> • Faculty Coordinator: <strong className="text-slate-700">{profile?.full_name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-100">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Academic compliance & event authorization</span>
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
          <div className="text-[11px] text-slate-500">Active student chapters</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {pendingEvents.length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">Awaiting faculty clearance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Approved Events</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {clubEvents.length}
          </div>
          <div className="text-[11px] text-slate-500">Live on campus calendar</div>
        </div>
      </div>

      {/* SECTION 1: PENDING EVENT APPROVALS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Pending Event Approvals ({pendingEvents.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review event schedules, room allocations, and safety logistics before publication.
            </p>
          </div>
        </div>

        <FacultyApprovalManager initialPendingEvents={pendingEvents} />
      </div>

      {/* SECTION 2: ADVISED STUDENT ORGANIZATIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          <span>Advised Student Organizations & Officers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClubs.map((club) => {
            const leads = (club.members || []).filter(
              (m: any) => m.role === "president" || m.role === "lead" || m.role === "vice_president"
            );
            const primaryLead = leads[0]?.profile;

            return (
              <div
                key={club.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {club.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {club.members?.length || 1} Members
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{club.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{club.description}</p>

                  {/* Club Lead Contact */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Club Lead / President:</span>
                    </div>
                    <div className="font-bold text-slate-800">
                      {primaryLead?.full_name || "Lead Officer Assigned"}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{primaryLead?.email || "club@mituniversity.edu.in"}</span>
                    </div>
                  </div>
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
                    <span>View Club Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: APPROVED CLUB EVENTS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Active & Historical Event Calendar</span>
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {clubEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active events currently recorded for your advised clubs.
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {evt.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {evt.club?.name} • Venue: {evt.venue} • Date: {dateFormatted} • Capacity: {evt.capacity}
                      </div>
                    </div>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
                    >
                      <span>Public Event Link</span>
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
