"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeClubMemberAction } from "@/lib/auth/actions";
import {
  Users,
  Search,
  UserX,
  Shield,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

export interface ClubMemberItem {
  id: string;
  club_id: string;
  profile_id: string;
  role: string;
  status: string;
  joined_at: string;
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    department: string | null;
    year_of_study: number | null;
  } | null;
}

interface Props {
  initialMembers: ClubMemberItem[];
  clubId: string;
  currentUserId: string;
}

export default function ClubLeadMembersManager({
  initialMembers,
  clubId,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<ClubMemberItem[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<ClubMemberItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;

    startTransition(async () => {
      const res = await removeClubMemberAction(clubId, memberToRemove.profile_id);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.profile_id !== memberToRemove.profile_id));
        setFeedback({
          text: `Removed ${memberToRemove.profile?.full_name || "member"} from the club roster.`,
          type: "success",
        });
        setMemberToRemove(null);
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to remove member.",
          type: "error",
        });
      }
    });
  };

  const filteredMembers = members.filter((m) => {
    const name = m.profile?.full_name?.toLowerCase() || "";
    const email = m.profile?.email?.toLowerCase() || "";
    const dept = m.profile?.department?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesQuery = !query || name.includes(query) || email.includes(query) || dept.includes(query);
    const matchesRole = selectedRole === "all" || m.role === selectedRole;

    return matchesQuery && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "president":
      case "lead":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Shield className="w-3 h-3 text-amber-600" />
            President / Lead
          </span>
        );
      case "vice_president":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Vice President
          </span>
        );
      case "officer":
      case "secretary":
      case "treasurer":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Officer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Member
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Active Member Roster</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {members.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Manage your club membership records and leadership roles.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="president">President</option>
            <option value="vice_president">Vice President</option>
            <option value="officer">Officers</option>
            <option value="member">General Members</option>
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
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No members match your criteria</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? "Try clearing your search query" : "Active members will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Year</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const name = member.profile?.full_name || "Club Member";
                  const email = member.profile?.email || "student@campus.edu";
                  const dept = member.profile?.department || "General";
                  const year = member.profile?.year_of_study ? `Year ${member.profile.year_of_study}` : "Undergraduate";
                  const isSelf = member.profile_id === currentUserId;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-slate-900 truncate">
                              {name} {isSelf && <span className="text-[10px] text-blue-600 font-normal">(You)</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getRoleBadge(member.role)}</td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{dept}</div>
                        <div className="text-[11px] text-slate-400">{year}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "Active"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSelf ? (
                          <button
                            type="button"
                            onClick={() => setMemberToRemove(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition font-semibold text-[11px]"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Self</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Remove Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-slate-900">
                {memberToRemove.profile?.full_name || "this member"}
              </strong>{" "}
              from the club roster? They will lose club membership and permissions.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmRemove}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50"
              >
                {isPending ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
