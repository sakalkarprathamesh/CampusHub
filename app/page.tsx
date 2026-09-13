import React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  UsersRound,
  Building2,
  Calendar,
  Layers,
  FileCheck2,
  QrCode,
  BellRing,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  getStatistics,
  getOrganizations,
  getClubs,
  getUpcomingEvents,
  getDatabaseStatus,
} from "@/lib/data";
import { ClubCard } from "@/components/clubs/ClubCard";
import { EventCard } from "@/components/events/EventCard";
import { OrgCard } from "@/components/organizations/OrgCard";

export default async function HomePage() {
  const [stats, organizations, featuredClubs, upcomingEvents, dbStatus] = await Promise.all([
    getStatistics(),
    getOrganizations(),
    getClubs({ limit: 4 }),
    getUpcomingEvents({ limit: 3 }),
    getDatabaseStatus(),
  ]);

  const dbStatusStyle = {
    connected: "bg-emerald-100 text-emerald-800 border-emerald-300",
    prototype: "bg-blue-100/80 text-blue-800 border-blue-200/60",
    error: "bg-rose-100 text-rose-800 border-rose-300",
  }[dbStatus.status];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 pt-16 pb-20 border-b border-slate-200/80">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/30 via-sky-200/20 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold border border-blue-200/60 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>CampusHub Phase 1 • MIT-ADT College</span>
              </div>
              <Link
                href="/supabase-test"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm transition-all hover:scale-105 ${dbStatusStyle}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                <span>{dbStatus.label}</span>
              </Link>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Connect. Collaborate. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Discover your college clubs, explore student communities, and stay connected with campus events in one centralized directory.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/clubs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
              >
                <Layers className="h-4 w-4" />
                <span>Explore Clubs</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
              <Link
                href="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
              >
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>View Events</span>
              </Link>
            </div>
          </div>

          {/* 2. REAL DATABASE STATISTICS COUNTERS */}
          <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/90 border border-slate-200/90 p-5 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-blue-50 text-blue-600 mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalClubs}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Active Clubs
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 border border-slate-200/90 p-5 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-purple-50 text-purple-600 mb-2">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalOrganizations}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Governing Communities
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 border border-slate-200/90 p-5 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.upcomingEventsCount}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Upcoming Events
              </div>
            </div>

            <div className="rounded-2xl bg-white/90 border border-slate-200/90 p-5 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-50 text-amber-600 mb-2">
                <UsersRound className="h-5 w-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalTeams}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Specialized Teams
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ORGANIZATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Campus Governance
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Top-Level Student Communities
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Apex organizations coordinating student initiatives and technical & cultural ecosystems.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <OrgCard key={org.id} organization={org} />
          ))}
        </div>
      </section>

      {/* 4. FEATURED CLUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Explore Chapters
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Featured Student Clubs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Join specialized teams in coding, robotics, product design, business, and performing arts.
            </p>
          </div>
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View all {stats.totalClubs} clubs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Campus Calendar
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Upcoming Campus Events
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hackathons, drone races, investor summits, and music festivals scheduled on campus.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Explore full calendar</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* 6. FUTURE FEATURES / ROADMAP (COMING SOON) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 2 Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              A Complete Campus Operating System in Development
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Phase 1 establishes the core relational directory. Phase 2 unlocks end-to-end event execution, administrative approvals, and student ticketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5">
              <div className="flex items-center justify-between mb-3">
                <FileCheck2 className="h-6 w-6 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Event Proposals & Approvals
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured proposal pipelines with automated faculty coordinator sign-off and document verification.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5">
              <div className="flex items-center justify-between mb-3">
                <QrCode className="h-6 w-6 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Digital Tickets & QR Attendance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant student registration passes, Apple/Google Wallet integration, and real-time gate scanning.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5">
              <div className="flex items-center justify-between mb-3">
                <GraduationCap className="h-6 w-6 text-purple-400" />
                <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Faculty & Admin Workspace
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated dashboards for professors to monitor club health, review budgets, and generate annual reports.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-5">
              <div className="flex items-center justify-between mb-3">
                <BellRing className="h-6 w-6 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Student Notifications
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Personalized alerts for upcoming workshops, team recruitment deadlines, and hackathon schedules.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
