"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelEventRegistrationAction } from "@/lib/auth/actions";
import { Event, EventRegistration } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  QrCode,
  X,
  AlertCircle,
} from "lucide-react";

interface Props {
  initialEvents: { event: Event; registration: EventRegistration }[];
}

export default function StudentRegisteredEvents({ initialEvents }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedPass, setSelectedPass] = useState<Event | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel your registration for "${title}"?`)) {
      return;
    }

    setCancellingId(eventId);
    setFeedback(null);

    startTransition(async () => {
      const res = await cancelEventRegistrationAction(eventId);
      setCancellingId(null);

      if (res.success) {
        setEvents((prev) => prev.filter((item) => item.event.id !== eventId));
        setFeedback({
          id: eventId,
          msg: "Registration successfully cancelled.",
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          id: eventId,
          msg: res.error || "Failed to cancel registration.",
          type: "error",
        });
      }
    });
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
          <Ticket className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Registered Events</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven&apos;t registered for any campus activities yet. Browse workshops, hackathons, and guest lectures.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <span>Browse Campus Events</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map(({ event, registration }) => {
          const isActing = isPending && cancellingId === event.id;
          const isPast = new Date(event.event_date) < new Date();

          return (
            <div
              key={registration.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed Pass
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(event.event_date)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h4>

                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTime(event.event_date)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPass(event)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Digital Pass</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${event.slug}`}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition"
                    title="View Event Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {!isPast && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleCancel(event.id, event.title)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition disabled:opacity-50"
                    >
                      {isActing ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Pass Preview Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 text-center relative">
            <button
              type="button"
              onClick={() => setSelectedPass(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Digital Event Pass
              </span>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                {selectedPass.title}
              </h3>
              <p className="text-xs text-slate-500">Venue: {selectedPass.venue}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 inline-block mx-auto shadow-inner">
              <div className="w-36 h-36 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white space-y-1">
                <QrCode className="w-20 h-20 text-blue-400" />
                <span className="text-[9px] font-mono tracking-widest text-slate-300">PASS-VERIFIED</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-800">Date: {formatDate(selectedPass.event_date)}</p>
              <p className="text-[11px]">Show this verified pass at the entrance scanner.</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPass(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
