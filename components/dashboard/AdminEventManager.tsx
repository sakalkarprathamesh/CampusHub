"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminReviewEventAction, getEventAttendeesAction } from "@/lib/auth/actions";
import { Event, EventRegistration } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  Eye,
  AlertTriangle,
  X,
  ExternalLink,
  Ban,
  RotateCcw,
} from "lucide-react";

interface Props {
  initialEvents: Event[];
}

export default function AdminEventManager({ initialEvents }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<Event | null>(null);
  const [attendeesList, setAttendeesList] = useState<EventRegistration[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReviewAction = (
    eventId: string,
    action: "approved" | "rejected" | "cancelled" | "restored",
    title: string
  ) => {
    startTransition(async () => {
      const res = await adminReviewEventAction({ eventId, action });
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, status: action === "restored" ? "approved" : action }
              : e
          )
        );
        setFeedback({
          text: `Event "${title}" marked as ${action}.`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || `Failed to update event.`,
          type: "error",
        });
      }
    });
  };

  const handleViewAttendees = async (event: Event) => {
    setAttendeesModalEvent(event);
    setIsLoadingAttendees(true);
    try {
      const list = await getEventAttendeesAction(event.id);
      setAttendeesList(list);
    } catch {
      setAttendeesList([]);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.club?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && (e.status === "approved" || e.status === "published")) ||
      (statusFilter === "pending" && (e.status === "pending_approval" || e.status === "submitted")) ||
      e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "published":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved & Live
          </span>
        );
      case "pending_approval":
      case "submitted":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            Pending Clearance
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            Rejected
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Campus Events & Schedules</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {events.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Administrative override for event authorizations, capacity checks, and roster inspections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Organizing Club</th>
                <th className="py-3 px-4">Date & Venue</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => {
                const isApproved = evt.status === "approved" || evt.status === "published";
                const isCancelled = evt.status === "cancelled";

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{evt.title}</span>
                          <Link href={`/events/${evt.slug}`} target="_blank">
                            <ExternalLink className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {evt.description}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {evt.club?.name || "Student Club"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{formatDate(evt.event_date)}</div>
                      <div className="text-[11px] text-slate-400">{evt.venue}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{evt.capacity}</span>
                      <span className="text-[10px] text-slate-400 block">seats</span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(evt.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewAttendees(evt)}
                          className="px-2 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Attendees</span>
                        </button>

                        {!isApproved && !isCancelled && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleReviewAction(evt.id, "approved", evt.title)}
                            className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Approve
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleReviewAction(evt.id, "cancelled", evt.title)}
                            className="px-2 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}

                        {isCancelled && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleReviewAction(evt.id, "restored", evt.title)}
                            className="px-2 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendees Roster Modal */}
      {attendeesModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 text-left relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registered Attendees</h3>
                <p className="text-xs text-slate-500">
                  {attendeesModalEvent.title} • {attendeesList.length} of {attendeesModalEvent.capacity} spots
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendeesModalEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingAttendees ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading attendees...</div>
              ) : attendeesList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No students registered yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attendeesList.map((reg) => (
                    <div key={reg.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{reg.user?.full_name || "Student"}</div>
                        <div className="text-[11px] text-slate-400">{reg.user?.email} • {reg.user?.department}</div>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setAttendeesModalEvent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
