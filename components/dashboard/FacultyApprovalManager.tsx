"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { facultyReviewEventAction } from "@/lib/auth/actions";
import { Event } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Building2,
  FileCheck,
  X,
  MessageSquare,
} from "lucide-react";

interface Props {
  initialPendingEvents: Event[];
}

export default function FacultyApprovalManager({ initialPendingEvents }: Props) {
  const router = useRouter();
  const [pendingEvents, setPendingEvents] = useState<Event[]>(initialPendingEvents);
  const [selectedEventForReject, setSelectedEventForReject] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (event: Event) => {
    startTransition(async () => {
      const res = await facultyReviewEventAction({
        eventId: event.id,
        action: "approved",
      });

      if (res.success) {
        setPendingEvents((prev) => prev.filter((e) => e.id !== event.id));
        setFeedback({
          text: `Event "${event.title}" has been approved and published to the campus calendar!`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to approve event.",
          type: "error",
        });
      }
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReject) return;

    if (!rejectionReason.trim()) {
      alert("Please provide a reason or constructive feedback for the club lead.");
      return;
    }

    startTransition(async () => {
      const res = await facultyReviewEventAction({
        eventId: selectedEventForReject.id,
        action: "rejected",
        rejectionReason: rejectionReason.trim(),
      });

      if (res.success) {
        setPendingEvents((prev) => prev.filter((e) => e.id !== selectedEventForReject.id));
        setFeedback({
          text: `Event "${selectedEventForReject.title}" was rejected with feedback sent to the club lead.`,
          type: "success",
        });
        setSelectedEventForReject(null);
        setRejectionReason("");
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to reject event.",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {pendingEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no club events awaiting faculty review or clearance.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/20 p-5 sm:p-6 shadow-sm space-y-4 transition hover:border-amber-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Faculty Review
                    </span>
                    <span className="text-xs font-semibold text-purple-700">
                      {evt.club?.name || "Student Organization"}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{evt.title}</h3>
                </div>

                {/* Approve / Reject Action Buttons */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setSelectedEventForReject(evt);
                      setRejectionReason("");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleApprove(evt)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
                {evt.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>
                    {formatDate(evt.event_date)} • {formatTime(evt.event_date)}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Max Capacity: {evt.capacity} seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {selectedEventForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Changes / Reject</h3>
                  <p className="text-[11px] text-slate-500">{selectedEventForReject.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventForReject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reason for Rejection / Required Modifications</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Auditorium B is reserved for University Exams on this date. Please reschedule or move to Conference Hall 2."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <p className="text-[11px] text-slate-400">
                  This note will be transmitted directly to the club lead so they can update and resubmit.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEventForReject(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !rejectionReason.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : "Send Rejection & Notify Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
