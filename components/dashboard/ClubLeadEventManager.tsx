"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEventAction, cancelEventAction, getEventAttendeesAction } from "@/lib/auth/actions";
import { Event, Club, EventRegistration } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarX,
  FileEdit,
  Eye,
  Sparkles,
} from "lucide-react";

interface Props {
  initialEvents: Event[];
  managedClubs: Club[];
  currentUserId: string;
}

export default function ClubLeadEventManager({
  initialEvents,
  managedClubs,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<Event | null>(null);
  const [attendeesList, setAttendeesList] = useState<EventRegistration[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [formClubId, setFormClubId] = useState(managedClubs[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("10:00");
  const [formEndTime, setFormEndTime] = useState("12:00");
  const [formVenue, setFormVenue] = useState("");
  const [formCapacity, setFormCapacity] = useState("100");
  const [formBannerUrl, setFormBannerUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Handle Event Creation
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData();
    formData.append("clubId", formClubId);
    formData.append("title", formTitle);
    formData.append("description", formDescription);
    formData.append("date", formDate);
    formData.append("startTime", formStartTime);
    formData.append("endTime", formEndTime);
    formData.append("venue", formVenue);
    formData.append("capacity", formCapacity);
    if (formBannerUrl.trim()) formData.append("bannerUrl", formBannerUrl.trim());

    startTransition(async () => {
      const res = await createEventAction(formData);
      if (res.success) {
        setIsCreateModalOpen(false);
        setFormTitle("");
        setFormDescription("");
        setFormDate("");
        setFormVenue("");
        setFeedback({
          text: "Event submitted! It has been placed in 'Pending Approval' for faculty review.",
          type: "success",
        });
        router.refresh();
      } else {
        setFormError(res.error || "Failed to create event.");
      }
    });
  };

  // Handle Cancel Event
  const handleCancelEvent = (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel "${title}"? All registered attendees will be notified.`)) {
      return;
    }

    startTransition(async () => {
      const res = await cancelEventAction(eventId);
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, status: "cancelled" } : e))
        );
        setFeedback({
          text: `Event "${title}" has been cancelled.`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to cancel event.",
          type: "error",
        });
      }
    });
  };

  // Load Attendees
  const handleViewAttendees = async (event: Event) => {
    setAttendeesModalEvent(event);
    setIsLoadingAttendees(true);
    try {
      const attendees = await getEventAttendeesAction(event.id);
      setAttendeesList(attendees);
    } catch {
      setAttendeesList([]);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

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
            Pending Faculty Approval
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            Changes Requested / Rejected
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
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Club Events Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize workshops, hackathons, and guest seminars for your student chapter.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreateModalOpen(true);
            setFormError(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Events Table / Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Events Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not created any events for your managed clubs yet. Click below to host your first event.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const isCancelled = event.status === "cancelled";
            const isRejected = event.status === "rejected";

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-blue-600 truncate max-w-[160px]">
                      {event.club?.name || "Club Event"}
                    </span>
                    {getStatusBadge(event.status)}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 line-clamp-1">{event.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(event.event_date)} • {formatTime(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Capacity: {event.capacity} Attendees</span>
                    </div>
                  </div>

                  {/* Rejection Reason notice if rejected */}
                  {isRejected && event.rejection_reason && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Faculty Review Feedback:</span>
                      </div>
                      <p className="text-[11px] text-red-700 pl-4.5">&ldquo;{event.rejection_reason}&rdquo;</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewAttendees(event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Attendees</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
                    >
                      Public Page &rarr;
                    </Link>

                    {!isCancelled && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCancelEvent(event.id, event.title)}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-left relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Host New Club Event</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Club Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Organizing Club</label>
                <select
                  value={formClubId}
                  onChange={(e) => setFormClubId(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {managedClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name} ({club.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Event Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Autonomous Bot Hackathon 2026"
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description & Agenda</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed schedule, prerequisites, and learning outcomes..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Venue & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Venue / Location</label>
                  <input
                    type="text"
                    required
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g., Auditorium B, Innovation Block"
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    placeholder="100"
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Poster URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  value={formBannerUrl}
                  onChange={(e) => setFormBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : "Submit for Faculty Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendees Roster Modal */}
      {attendeesModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 text-left relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Event Attendees</h3>
                <p className="text-xs text-slate-500">
                  {attendeesModalEvent.title} • {attendeesList.length} of {attendeesModalEvent.capacity} spots registered
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendeesModalEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingAttendees ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading attendee roster...</div>
              ) : attendeesList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No students have registered for this event yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attendeesList.map((reg) => (
                    <div key={reg.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {reg.user?.full_name || "Student Attendee"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {reg.user?.email || "student@campus.edu"} • {reg.user?.department || "Student"}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Registered {new Date(reg.created_at).toLocaleDateString()}
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
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
