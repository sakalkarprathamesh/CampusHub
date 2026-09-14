"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewMembershipRequestAction } from "@/lib/auth/actions";
import { Check, X, Clock, User, Mail, GraduationCap, Building2 } from "lucide-react";

export interface ClubLeadRequest {
  id: string;
  club_id: string;
  status: string;
  message: string | null;
  created_at: string;
  applicant: {
    id: string;
    full_name: string;
    email: string;
    department: string | null;
    year_of_study: string | null;
    bio?: string | null;
    skills?: string[] | null;
  };
  club: {
    id: string;
    name: string;
  };
}

interface Props {
  initialRequests: ClubLeadRequest[];
}

export default function ClubLeadRequestsManager({ initialRequests }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState<ClubLeadRequest[]>(initialRequests);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<ClubLeadRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReview = (requestId: string, action: "approved" | "rejected", reason?: string) => {
    setActiveActionId(requestId);
    setFeedback(null);

    startTransition(async () => {
      const res = await reviewMembershipRequestAction({
        requestId,
        action,
        rejectionReason: reason,
      });
      setActiveActionId(null);
      setRejectingRequest(null);
      setRejectionReason("");

      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setFeedback({
          id: requestId,
          text: `Application has been ${action}.${reason ? ` Reason provided: "${reason}"` : ""}`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          id: requestId,
          text: res.error || `Failed to ${action} request.`,
          type: "error",
        });
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-1">
          <Check className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-900">All Applications Reviewed!</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are currently no pending membership requests waiting for review. New applicants will show up here.
        </p>
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
          {feedback.text}
        </div>
      )}

      <div className="space-y-4">
        {requests.map((req) => {
          const isActing = isPending && activeActionId === req.id;
          const formattedDate = new Date(req.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {req.applicant.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">
                        {req.applicant.full_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {req.applicant.email}
                      </span>
                      {req.applicant.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {req.applicant.department}
                        </span>
                      )}
                      {req.applicant.year_of_study && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {req.applicant.year_of_study}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approve / Reject Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleReview(req.id, "approved")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl text-xs transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => {
                      setRejectingRequest(req);
                      setRejectionReason("");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl text-xs transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Message from applicant */}
              {req.message && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Applicant Note: </span>
                  &ldquo;{req.message}&rdquo;
                </div>
              )}

              {/* Applicant Skills Tags */}
              {req.applicant.skills && req.applicant.skills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Skills:</span>
                  {req.applicant.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100">
                <span>Applied for: {req.club.name}</span>
                <span>Submitted on {formattedDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Reject Application
              </h3>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              You are declining <strong>{rejectingRequest.applicant.full_name}</strong>&apos;s application for <strong>{rejectingRequest.club.name}</strong>. You can provide constructive feedback below.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Rejection Reason / Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Currently prioritizing upper-year students with robotics experience; feel free to reapply next semester."
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleReview(rejectingRequest.id, "rejected", rejectionReason.trim() || undefined)
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Declining..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
