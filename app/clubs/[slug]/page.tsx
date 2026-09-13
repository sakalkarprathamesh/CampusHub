import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClubBySlug,
  getClubLeadership,
  getClubTeams,
  getClubEvents,
} from "@/lib/data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { LeadershipCard } from "@/components/clubs/LeadershipCard";
import { TeamCard } from "@/components/clubs/TeamCard";
import { EventCard } from "@/components/events/EventCard";
import { getCategoryBadgeColor } from "@/lib/utils";
import {
  Mail,
  Phone,
  Building2,
  UsersRound,
  Calendar,
  Layers,
  Sparkles,
  UserPlus,
  Send,
  CalendarDays,
  CalendarCheck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface ClubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) return { title: "Club Not Found — CampusHub" };
  return {
    title: `${club.name} — CampusHub`,
    description: club.description,
  };
}

export default async function ClubDetailPage({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  const badgeColors = getCategoryBadgeColor(club.category);
  const now = new Date();
  const allEvents = club.events || [];
  const upcomingEvents = allEvents.filter(
    (e) => new Date(e.event_date) >= now && e.status === "published"
  );
  const pastEvents = allEvents.filter((e) => new Date(e.event_date) < now);

  const president = club.president;
  const vicePresident = club.vice_president;
  const facultyCoordinator = club.faculty_coordinator;

  return (
    <div className="space-y-10 pb-20">
      {/* 1. CLUB HERO BANNER */}
      <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        {club.banner_url && (
          <div className="absolute inset-0 opacity-25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={club.banner_url}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/50" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: "Clubs", href: "/clubs" },
                { label: club.name },
              ]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_span]:text-white"
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Club Logo */}
            <Avatar
              src={club.logo_url}
              fallback={club.name}
              size="xl"
              className="h-24 w-24 rounded-3xl border-2 border-white/20 shadow-2xl bg-white/10 shrink-0"
            />

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${badgeColors.bg} ${badgeColors.border}`}
                >
                  {club.category}
                </span>

                {club.organization && (
                  <Link
                    href={`/organizations/${club.organization.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-3 py-0.5 rounded-full border border-slate-700 transition-colors"
                  >
                    <Building2 className="h-3 w-3 text-blue-400" />
                    <span>{club.organization.name}</span>
                    <ChevronRight className="h-3 w-3 text-slate-500" />
                  </Link>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {club.name}
              </h1>

              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                {club.description}
              </p>

              {/* Contact bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                {club.contact_email && (
                  <a
                    href={`mailto:${club.contact_email}`}
                    className="inline-flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{club.contact_email}</span>
                  </a>
                )}
                {club.contact_phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{club.contact_phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 8 COLUMNS: Leadership, Teams, Events */}
          <div className="lg:col-span-8 space-y-12">
            {/* 2. CLUB LEADERSHIP */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span>Club Leadership & Mentorship</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elected student heads and faculty coordinator overseeing club governance and operations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {president && (
                  <LeadershipCard profile={president} roleLabel="President" />
                )}
                {vicePresident && (
                  <LeadershipCard
                    profile={vicePresident}
                    roleLabel="Vice President"
                  />
                )}
                {facultyCoordinator ? (
                  <LeadershipCard
                    profile={facultyCoordinator}
                    roleLabel="Faculty Coordinator"
                    isFaculty={true}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="h-8 w-8 text-slate-300 mb-1" />
                    <p className="text-xs font-semibold text-slate-700">
                      Faculty Coordinator
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned by Department Dean
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. CLUB TEAMS */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UsersRound className="h-5 w-5 text-blue-600" />
                    <span>Specialized Teams</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Functional wings and project tracks driving club activities.
                  </p>
                </div>
                <Badge variant="outline" size="sm">
                  {club.teams?.length || 0} Teams
                </Badge>
              </div>

              <div className="space-y-3">
                {club.teams && club.teams.length > 0 ? (
                  club.teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No teams currently registered.
                  </p>
                )}
              </div>
            </section>

            {/* 4. UPCOMING EVENTS */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <span>Upcoming Club Events</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hackathons, workshops, and exhibitions hosted by {club.name}.
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {upcomingEvents.length} Scheduled
                </Badge>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    No upcoming events currently scheduled
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    The club team is currently drafting future proposals for faculty review.
                  </p>
                </div>
              )}
            </section>

            {/* 5. PAST EVENTS */}
            {pastEvents.length > 0 && (
              <section className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-slate-600" />
                      <span>Past Events & Highlights</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Completed symposiums, contests, and workshops.
                    </p>
                  </div>
                  <Badge variant="default" size="sm">
                    {pastEvents.length} Archived
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: Club Metadata & Future Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Club At-A-Glance Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Club Information
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500">Governing Body</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {club.organization?.name || "Independent"}
                  </span>
                </div>

                <div className="flex justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500">Domain / Category</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {club.category}
                  </span>
                </div>

                <div className="flex justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500">Functional Teams</span>
                  <span className="font-semibold text-slate-900">
                    {club.teams?.length || 0}
                  </span>
                </div>

                <div className="flex justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Events Hosted</span>
                  <span className="font-semibold text-slate-900">
                    {allEvents.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active University Chapter
                  </span>
                </div>
              </div>
            </div>

            {/* FUTURE ACTIONS (Clearly Labeled "Coming Soon") */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Student Member Actions
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Phase 2
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Direct member onboarding, team applications, and verified messaging will activate once student SSO launches.
              </p>

              <div className="space-y-2.5 pt-1">
                {/* Join Club Action */}
                <button
                  disabled
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Join Club as General Member</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Coming Soon
                  </span>
                </button>

                {/* Apply for Team */}
                <button
                  disabled
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Apply for Team Lead / Core</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Coming Soon
                  </span>
                </button>

                {/* Contact President */}
                <button
                  disabled
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Direct In-App Message President</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
