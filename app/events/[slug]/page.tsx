import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  Sparkles,
  Ticket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }
  return {
    title: `${event.title} — CampusHub`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className="space-y-10 pb-20">
      {/* 1. HERO BANNER */}
      <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        {event.banner_url && (
          <div className="absolute inset-0 opacity-30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.banner_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Breadcrumbs
            items={[
              { label: "Events", href: "/events" },
              { label: event.title },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_span]:text-white"
          />

          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {event.status === "cancelled" ? (
                <Badge variant="destructive" size="sm" className="bg-rose-600 text-white border-transparent">
                  Cancelled Event
                </Badge>
              ) : isPast ? (
                <Badge variant="default" size="sm" className="bg-slate-800 text-slate-300 border-slate-700">
                  Completed Event
                </Badge>
              ) : (
                <Badge variant="primary" size="sm" className="bg-blue-600 text-white border-transparent">
                  Published & Active
                </Badge>
              )}

              {event.club && (
                <Link
                  href={`/clubs/${event.club.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-3 py-0.5 rounded-full border border-slate-700 transition-colors"
                >
                  <Building2 className="h-3 w-3 text-blue-400" />
                  <span>Hosted by {event.club.name}</span>
                </Link>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Quick date & venue badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-2">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-white">
                  {formatDate(event.event_date)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>
                  {formatTime(event.event_date)}
                  {event.end_date && ` - ${formatTime(event.end_date)}`}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>{event.venue}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 8 COLUMNS: Full description & agenda */}
          <div className="lg:col-span-8 space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                About This Event
              </h2>

              <div className="prose text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>

              {/* Event Schedule Breakdown */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Event Schedule & Logistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Date & Start Time</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {formatDateTime(event.event_date)}
                    </p>
                  </div>
                  {event.end_date && (
                    <div>
                      <span className="text-slate-500">Estimated Concluding Time</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {formatDateTime(event.end_date)}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Venue & Campus Location</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{event.venue}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Auditorium / Lab Capacity</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{event.capacity} Attendees</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Organizing Club Card */}
            {event.club && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Organizing Student Chapter
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={event.club.logo_url}
                      fallback={event.club.name}
                      size="lg"
                      className="rounded-2xl"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {event.club.name}
                      </h4>
                      <p className="text-xs text-slate-500">{event.club.category}</p>
                    </div>
                  </div>

                  <Link
                    href={`/clubs/${event.club.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    <span>View Club Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: Registration & Pass Widget (Coming Soon) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Registration Box */}
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registration
                </span>
                <Badge variant="primary" size="sm">
                  {isPast ? "Event Closed" : "Open for Students"}
                </Badge>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">
                  Free Student Pass
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Valid for all enrolled MIT-ADT University students.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified attendance record</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>E-Certificate of Participation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Direct entry with Digital QR Pass</span>
                </div>
              </div>

              {/* ACTION: COMING SOON BUTTON */}
              <div className="pt-2">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 py-3 px-4 text-xs font-bold text-slate-400 cursor-not-allowed shadow-none"
                >
                  <Ticket className="h-4 w-4 text-slate-400" />
                  <span>Student Registration — Coming Soon (Phase 2)</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Self-registration & QR ticket issuance will activate in Phase 2 with SSO.
                </p>
              </div>
            </div>

            {/* Event Meta Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Logistics Overview</h4>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Capacity</span>
                  <span className="font-semibold text-slate-900">{event.capacity} Seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold capitalize text-emerald-600">{event.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Published Via</span>
                  <span className="font-semibold text-slate-900">CampusHub Directory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
