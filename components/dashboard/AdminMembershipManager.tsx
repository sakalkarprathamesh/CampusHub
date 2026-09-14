"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewMembershipRequestAction } from "@/lib/auth/actions";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  AlertCircle,
  X,
  MessageSquare,
} from "lucide-react";

export interface AdminMembershipRequest {
  id: string;
  club_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  rejection_reason?: string | null;
  created_at: string;
  applicant?: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
  } | null;
  club?: {
    id: string;
    name: string;
  } | null;
}

interface Props {
  initialRequests: AdminMembershipRequest[];
}

export default function AdminMembershipManager({ initialRequests }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState<AdminMembershipRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClub, setSelectedClub] = useState("all");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<AdminMembershipRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApprove = (req: AdminMembershipRequest) => {
    startTransition(async () => {
      const res = await reviewMembershipRequestAction({
        requestId: req.id,
        action: "approved",
      });

      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
        );
        setFeedback({
          text: `Approved membership request for ${req.applicant?.full_name || "student"}.`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to approve request.",
          type: "error",
        });
      }
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;

    startTransition(async () => {
      const res = await reviewMembershipRequestAction({
        requestId: rejectingRequest.id,
        action: "rejected",
        rejectionReason: rejectionReason.trim(),
      });

      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === rejectingRequest.id
              ? { ...r, status: "rejected", rejection_reason: rejectionReason.trim() }
              : r
          )
        );
        setFeedback({
          text: `Membership request rejected with reason provided.`,
          type: "success",
        });
        setRejectingRequest(null);
        setRejectionReason("");
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to reject request.",
          type: "error",
        });
      }
    });
  };

  const uniqueClubs = Array.from(
    new Set(requests.map((r) => r.club?.name).filter(Boolean))
  );

  const filteredRequests = requests.filter((r) => {
    const applicantName = r.applicant?.full_name?.toLowerCase() || "";
    const applicantEmail = r.applicant?.email?.toLowerCase() || "";
    const clubName = r.club?.name?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || applicantName.includes(q) || applicantEmail.includes(q) || clubName.includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesClub = selectedClub === "all" || r.club?.name === selectedClub;

    return matchesSearch && matchesStatus && matchesClub;
  });

  const getStatusBadge = (req: AdminMembershipRequest) => {
    switch (req.status) {
      case "approved":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Admitted
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            Declined
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
            <Users className="w-5 h-5 text-amber-600" />
            <span>Campus Membership Requests</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              {requests.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Monitor, approve, or decline student applications across all college chapters.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student/club..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Declined</option>
          </select>

          {uniqueClubs.length > 0 && (
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white max-w-[140px] truncate"
            >
              <option value="all">All Clubs</option>
              {uniqueClubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          )}
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

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No membership requests found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Target Club</th>
                  <th className="py-3 px-4">Applicant Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900">
                          {req.applicant?.full_name || "Student Applicant"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {req.applicant?.email} • {req.applicant?.department}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {req.club?.name || "Student Club"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div className="line-clamp-2 italic text-[11px]">
                        &ldquo;{req.message || "No motivation statement provided."}&rdquo;
                      </div>
                      {req.status === "rejected" && req.rejection_reason && (
                        <div className="text-[10px] text-red-600 mt-0.5">
                          Declined reason: {req.rejection_reason}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(req)}</td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleApprove(req)}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setRejectingRequest(req);
                              setRejectionReason("");
                            }}
                            className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Decline Application</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <p className="text-xs text-slate-600">
                Provide feedback to <strong>{rejectingRequest.applicant?.full_name || "the applicant"}</strong>:
              </p>

              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Roster is currently at capacity for this semester..."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !rejectionReason.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50"
                >
                  {isPending ? "Declining..." : "Decline with Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
