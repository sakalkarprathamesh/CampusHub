"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { requestMembershipAction, cancelMembershipRequestAction } from "@/lib/auth/actions";
import {
  UserPlus,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  AlertCircle,
  X,
  Send,
  Sparkles,
} from "lucide-react";

interface Props {
  clubId: string;
  clubName: string;
  isLoggedIn: boolean;
  isMember: boolean;
  memberRole?: string | null;
  initialPendingRequestId?: string | null;
  initialStatus?: "pending" | "approved" | "rejected" | "cancelled" | null;
}

export default function JoinClubButton({
  clubId,
  clubName,
  isLoggedIn,
  isMember: initialIsMember,
  memberRole,
  initialPendingRequestId,
  initialStatus,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<string | null>(
    initialIsMember ? "approved" : initialStatus || null
  );
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(
    initialPendingRequestId || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 1. Not Logged In
  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <Link
          href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Sign In to Join Club</span>
        </Link>
        <p className="text-[11px] text-slate-500 text-center">
          Active students can request general or team membership.
        </p>
      </div>
    );
  }

  // 2. Already Active Member
  if (status === "approved" || initialIsMember) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2 text-left">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>You are an Active Member</span>
        </div>
        <p className="text-[11px] text-emerald-700/90 leading-relaxed">
          You are enrolled in <strong>{clubName}</strong> with official status{" "}
          <span className="font-semibold uppercase">({memberRole || "member"})</span>.
        </p>
      </div>
    );
  }

  // 3. Pending Application
  if (status === "pending") {
    const handleCancel = () => {
      if (!pendingRequestId) return;
      if (!confirm("Are you sure you want to cancel this application?")) return;

      startTransition(async () => {
        const res = await cancelMembershipRequestAction(pendingRequestId);
        if (res.success) {
          setStatus("cancelled");
          setFeedback("Application cancelled.");
          router.refresh();
        } else {
          setError(res.error || "Could not cancel request.");
        }
      });
    };

    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
            <span>Application Under Review</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-amber-700 border border-amber-200">
            Pending
          </span>
        </div>
        <p className="text-[11px] text-amber-700/90 leading-relaxed">
          Your request to join <strong>{clubName}</strong> has been received and is awaiting review by club officers.
        </p>
        {pendingRequestId && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="w-full py-1.5 px-3 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/60 border border-red-200/80 rounded-lg transition disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Cancel Application"}
          </button>
        )}
      </div>
    );
  }

  // 4. Submit Join Request Handler
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await requestMembershipAction(clubId, message);
      if (res.success) {
        setStatus("pending");
        setIsModalOpen(false);
        setMessage("");
        router.refresh();
      } else {
        setError(res.error || "Failed to submit request.");
      }
    });
  };

  return (
    <>
      <div className="space-y-2.5">
        {feedback && (
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
            {feedback}
          </div>
        )}

        {status === "rejected" && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
            Your previous application was not approved. You can submit a new application below.
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Apply to Join Club</span>
        </button>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Join {clubName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Why would you like to join? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a brief sentence about your background, relevant projects, or what you'd like to contribute..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <div className="font-semibold">What happens next:</div>
                <p className="text-blue-800/80 leading-relaxed">
                  Club officers and faculty coordinators will be notified. Once approved, you will gain access to club member privileges and team projects.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
