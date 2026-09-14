"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelMembershipRequestAction } from "@/lib/auth/actions";
import { MembershipRequestWithDetails } from "@/types/database";
import { Clock, CheckCircle2, XCircle, Ban, ArrowRight, Building } from "lucide-react";

interface Props {
  initialRequests: MembershipRequestWithDetails[];
}

export default function StudentRequestsList({ initialRequests }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this membership request?")) {
      return;
    }

    setCancellingId(requestId);
    setFeedback(null);

    startTransition(async () => {
      const res = await cancelMembershipRequestAction(requestId);
      setCancellingId(null);

      if (res.success) {
        setRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status: "cancelled" } : req))
        );
        setFeedback({
          id: requestId,
          message: "Membership application cancelled.",
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          id: requestId,
          message: res.error || "Failed to cancel request.",
          type: "error",
        });
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Membership Applications</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You have not applied to any clubs yet. Discover student organizations that match your interests.
        </p>
        <Link
          href="/clubs"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition"
        >
          <span>Explore Clubs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Not Approved
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const clubName = request.club?.name || "Campus Club";
        const clubSlug = request.club?.slug;
        const formattedDate = new Date(request.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={request.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-slate-900">{clubName}</h4>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Applied on {formattedDate}</p>
              </div>

              <div className="flex items-center gap-2">
                {request.status === "pending" && (
                  <button
                    type="button"
                    disabled={isPending && cancellingId === request.id}
                    onClick={() => handleCancel(request.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition disabled:opacity-50"
                  >
                    {isPending && cancellingId === request.id ? "Cancelling..." : "Cancel Request"}
                  </button>
                )}

                {clubSlug && (
                  <Link
                    href={`/clubs/${clubSlug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                  >
                    <span>View Club</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {request.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Application Message: </span>
                {request.message}
              </div>
            )}

            {feedback && feedback.id === request.id && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
