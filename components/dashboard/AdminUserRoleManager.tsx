"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateUserRoleAction } from "@/lib/auth/actions";
import { UserRole, Profile } from "@/types/database";
import { ROLE_CONFIGS, getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import { Search, Shield, User, Check, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  initialUsers: Profile[];
  currentAdminId: string;
}

const ALL_ROLES: UserRole[] = [
  "student",
  "club_member",
  "club_lead",
  "faculty_coordinator",
  "admin",
];

export default function AdminUserRoleManager({ initialUsers, currentAdminId }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [feedback, setFeedback] = useState<{ userId: string; text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleStartEdit = (user: Profile) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
    setFeedback(null);
  };

  const handleSaveRole = (userId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await adminUpdateUserRoleAction(userId, selectedRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: selectedRole } : u))
        );
        setFeedback({
          userId,
          text: `Role updated to ${getRoleLabel(selectedRole)}.`,
          type: "success",
        });
        setEditingUserId(null);
        router.refresh();
      } else {
        setFeedback({
          userId,
          text: res.error || "Failed to update role.",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>User Accounts & Role Permissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student access, assign club leadership, and configure faculty permissions.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg text-slate-700 self-start sm:self-auto">
          {users.length} Registered Profiles
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600 text-slate-700"
        >
          <option value="all">All Roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {getRoleLabel(r)}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 uppercase font-semibold text-slate-500">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Department / Year</th>
              <th className="py-3 px-4">Current Role</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No matching user accounts found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isEditing = editingUserId === u.id;
                const isSelf = u.id === currentAdminId;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {u.full_name?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.full_name || "Anonymous User"}</span>
                            {isSelf && (
                              <span className="text-[10px] font-normal text-blue-600">(You)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{u.department || "Undeclared"}</div>
                      <div className="text-[11px] text-slate-400">{u.year_of_study || "Student"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs font-semibold"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {getRoleLabel(r)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${getRoleBadgeClass(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSaveRole(u.id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(u)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                        >
                          Change Role
                        </button>
                      )}

                      {feedback && feedback.userId === u.id && (
                        <div className={`mt-1 text-[11px] ${feedback.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                          {feedback.text}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
