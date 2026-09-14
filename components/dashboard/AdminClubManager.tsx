"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminUpdateClubAction } from "@/lib/auth/actions";
import { Club, Profile } from "@/types/database";
import {
  Building,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  X,
  MessageSquare,
} from "lucide-react";

interface Props {
  initialClubs: Club[];
  facultyMembers: Profile[];
}

export default function AdminClubManager({ initialClubs, facultyMembers }: Props) {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [rejectingClub, setRejectingClub] = useState<Club | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (
    clubId: string,
    status: "approved" | "rejected" | "suspended" | "draft" | "pending_approval",
    isActive: boolean
  ) => {
    startTransition(async () => {
      const res = await adminUpdateClubAction(clubId, {
        status,
        is_active: isActive,
      });

      if (res.success) {
        setClubs((prev) =>
          prev.map((c) => (c.id === clubId ? { ...c, status, is_active: isActive } : c))
        );
        setFeedback({
          text: `Club status updated to ${status}.`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to update club status.",
          type: "error",
        });
      }
    });
  };

  const handleAssignFaculty = (clubId: string, facultyId: string) => {
    startTransition(async () => {
      const res = await adminUpdateClubAction(clubId, {
        faculty_coordinator_id: facultyId || null,
      });

      if (res.success) {
        setClubs((prev) =>
          prev.map((c) =>
            c.id === clubId ? { ...c, faculty_coordinator_id: facultyId || null } : c
          )
        );
        setFeedback({
          text: "Faculty advisor assigned successfully.",
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to assign faculty advisor.",
          type: "error",
        });
      }
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingClub) return;

    startTransition(async () => {
      const res = await adminUpdateClubAction(rejectingClub.id, {
        status: "rejected",
        is_active: false,
      });

      if (res.success) {
        setClubs((prev) =>
          prev.map((c) => (c.id === rejectingClub.id ? { ...c, status: "rejected", is_active: false } : c))
        );
        setFeedback({
          text: `Club "${rejectingClub.name}" application rejected.`,
          type: "success",
        });
        setRejectingClub(null);
        setRejectionReason("");
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to reject club.",
          type: "error",
        });
      }
    });
  };

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.is_active) ||
      c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (club: Club) => {
    if (club.status === "suspended" || !club.is_active) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
          Suspended / Inactive
        </span>
      );
    }
    if (club.status === "pending_approval") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          Pending Approval
        </span>
      );
    }
    if (club.status === "rejected") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          Charter Denied
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Active & Approved
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            <span>Campus Clubs & Chapters Registry</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              {clubs.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Grant charters, assign faculty coordinators, or suspend inactive student chapters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved / Active</option>
            <option value="pending_approval">Pending Clearance</option>
            <option value="suspended">Suspended</option>
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
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Clubs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Club Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Faculty Advisor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClubs.map((club) => {
                const isSuspended = club.status === "suspended" || !club.is_active;

                return (
                  <tr key={club.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{club.name}</span>
                          <Link href={`/clubs/${club.slug}`} target="_blank">
                            <ExternalLink className="w-3 h-3 text-slate-400 hover:text-purple-600" />
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {club.description}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {club.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(club)}</td>

                    <td className="py-3.5 px-4">
                      <select
                        value={club.faculty_coordinator_id || ""}
                        disabled={isPending}
                        onChange={(e) => handleAssignFaculty(club.id, e.target.value)}
                        className="text-[11px] rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 max-w-[170px] truncate"
                      >
                        <option value="">-- No Advisor Assigned --</option>
                        {facultyMembers.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.full_name || f.email}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {club.status === "pending_approval" && (
                          <>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleUpdateStatus(club.id, "approved", true)}
                              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => {
                                setRejectingClub(club);
                                setRejectionReason("");
                              }}
                              className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-[11px] font-semibold transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {club.status !== "pending_approval" && (
                          <>
                            {isSuspended ? (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleUpdateStatus(club.id, "approved", true)}
                                className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleUpdateStatus(club.id, "suspended", false)}
                                className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-semibold transition"
                              >
                                Suspend
                              </button>
                            )}
                          </>
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

      {/* Reject Modal */}
      {rejectingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Reject Club Application</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingClub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <p className="text-xs text-slate-600">
                Are you sure you want to reject the charter for <strong>{rejectingClub.name}</strong>?
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Reason / Notes</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Incomplete constitution document..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingClub(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50"
                >
                  {isPending ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
