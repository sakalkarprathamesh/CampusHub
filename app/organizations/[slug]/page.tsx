import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrganizationBySlug,
  getOrganizations,
  getUpcomingEvents,
} from "@/lib/data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ClubCard } from "@/components/clubs/ClubCard";
import { EventCard } from "@/components/events/EventCard";
import {
  Building2,
  Layers,
  Calendar,
  Network,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface OrgPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OrgPageProps) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) {
    notFound();
  }
  return {
    title: `${org.name} — CampusHub`,
    description: org.description,
  };
}

export default async function OrganizationDetailPage({ params }: OrgPageProps) {
  const { slug } = await params;
  const [org, upcomingEvents] = await Promise.all([
    getOrganizationBySlug(slug),
    getUpcomingEvents(),
  ]);

  if (!org) {
    notFound();
  }

  // Filter events belonging to clubs of this organization
  const orgClubIds = new Set((org.clubs || []).map((c) => c.id));
  const orgEvents = upcomingEvents.filter((e) => orgClubIds.has(e.club_id));

  return (
    <div className="space-y-10 pb-20">
      {/* ORGANIZATION HERO BANNER */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: org.name },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_span]:text-white"
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar
              src={org.logo_url}
              fallback={org.name}
              size="xl"
              className="h-24 w-24 rounded-3xl border-2 border-white/20 shadow-2xl bg-white/10 shrink-0"
            />

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30">
                  Governing Community
                </span>
                <Badge variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  {org.club_count || org.clubs?.length || 0} Affiliated Clubs
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {org.name}
              </h1>

              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                {org.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ORGANIZATIONAL HIERARCHY TREE VIEW */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Network className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Organizational Structure & Hierarchy
            </h2>
          </div>

          <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200/80">
            {/* Root Node: Organization */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm max-w-md">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{org.name}</div>
                <div className="text-[11px] text-slate-500">Apex Governing Body</div>
              </div>
            </div>

            {/* Connecting lines & Child Clubs */}
            <div className="ml-5 pl-6 border-l-2 border-dashed border-blue-300 mt-2 space-y-3 pt-2">
              {org.clubs && org.clubs.length > 0 ? (
                org.clubs.map((childClub) => (
                  <Link
                    key={childClub.id}
                    href={`/clubs/${childClub.slug}`}
                    className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-blue-50/60 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm group max-w-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={childClub.logo_url}
                        fallback={childClub.name}
                        size="sm"
                        className="rounded-lg"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {childClub.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {childClub.category}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No child clubs registered yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* AFFILIATED CLUBS GRID */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                <span>Constituent Student Clubs</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clubs and project chapters operating under {org.name}.
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {org.clubs?.length || 0} Clubs
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {org.clubs && org.clubs.length > 0 ? (
              org.clubs.map((club) => (
                <ClubCard key={club.id} club={{ ...club, organization: org }} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <Layers className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No clubs currently affiliated with this community</p>
                <p className="text-[11px] text-slate-400 mt-0.5">New student chapters will appear here once registered.</p>
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING EVENTS OF THIS COMMUNITY */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Community Events Schedule</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upcoming campus activities hosted by constituent clubs.
              </p>
            </div>
            <Badge variant="outline" size="sm">
              {orgEvents.length} Events
            </Badge>
          </div>

          {orgEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {orgEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                No upcoming events currently scheduled in this community
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Check back soon or explore events from other student organizations.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
