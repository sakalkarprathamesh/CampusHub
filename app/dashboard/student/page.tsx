import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getUpcomingEvents } from "@/lib/data";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import StudentRequestsList from "@/components/dashboard/StudentRequestsList";

export const dynamic = "force-dynamic";

import {
  Users,
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const { user, profile, memberships, pendingRequests } = await getCurrentProfile();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/student");
  }

  const upcomingEvents = await getUpcomingEvents({ limit: 3 });

  const activeMemberships = memberships.filter((m) => m.status === "active");
  const activePendingRequests = pendingRequests.filter((r) => r.status === "pending");

  const role = profile?.role || "student";
  const roleBadge = getRoleBadgeClass(role);
  const roleLabel = getRoleLabel(role);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : "ST"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {profile?.full_name || "Student"}!
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {profile?.department || "Campus Community Member"} {profile?.year_of_study ? `• ${profile.year_of_study}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <Link
            href="/clubs"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Clubs</span>
          </Link>
          <Link
            href="/profile"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium rounded-xl transition"
          >
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Joined Clubs</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {activeMemberships.length}
          </div>
          <div className="text-[11px] text-slate-500">Active club memberships</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {activePendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting club leadership review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Upcoming Events</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {upcomingEvents.length}
          </div>
          <div className="text-[11px] text-slate-500">Campus activities scheduled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Profile Status</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {profile?.skills && profile.skills.length > 0 ? "Complete" : "Basic"}
          </div>
          <div className="text-[11px] text-slate-500">
            {profile?.skills?.length || 0} skills & competencies
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Clubs & Applications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Memberships */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>My Active Clubs</span>
              </h2>
              <Link
                href="/clubs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeMemberships.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">You haven&apos;t joined any clubs yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Campus organizations are where you build projects, gain leadership experience, and make lasting friends.
                </p>
                <Link
                  href="/clubs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition"
                >
                  <span>Explore Campus Clubs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeMemberships.map((membership) => {
                  const club = membership.club;
                  if (!club) return null;
                  return (
                    <div
                      key={membership.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {club.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                            {membership.role}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 line-clamp-1">{club.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{club.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Active Member</span>
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <span>Visit Club</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Membership Requests Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Membership Applications</span>
            </h2>
            <StudentRequestsList initialRequests={pendingRequests} />
          </div>
        </div>

        {/* Right Col: Campus Calendar & Quick Highlights */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Upcoming Campus Events</span>
              </h3>
              <Link
                href="/events"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => {
                const dateStr = new Date(evt.event_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.slug}`}
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 transition space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-blue-600">{dateStr}</span>
                      <span>{evt.venue}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{evt.title}</div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* College Student Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 p-6 space-y-3 text-xs text-blue-950">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>CampusHub Student Tip</span>
            </div>
            <p className="leading-relaxed text-blue-800/90">
              Clubs review applications regularly. Fill out your department, year, and skills in your{" "}
              <Link href="/profile" className="font-semibold underline hover:text-blue-950">
                Student Profile
              </Link>{" "}
              so club officers can match you to specialized teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
