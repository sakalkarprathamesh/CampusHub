"use client";

import { useState } from "react";
import { AdminActivityLog } from "@/types/database";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Activity,
  Search,
  Shield,
  Clock,
  Calendar,
  UserCheck,
  Building,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface Props {
  initialLogs: AdminActivityLog[];
}

export default function AdminActivityLogViewer({ initialLogs }: Props) {
  const [logs] = useState<AdminActivityLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = logs.filter((log) => {
    const userStr = log.user?.full_name?.toLowerCase() || log.user?.email?.toLowerCase() || "";
    const actionStr = log.action.toLowerCase();
    const targetStr = (log.target_type || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || userStr.includes(q) || actionStr.includes(q) || targetStr.includes(q);
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter);

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("role")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          Role Change
        </span>
      );
    }
    if (action.includes("event")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Event Mod
        </span>
      );
    }
    if (action.includes("club")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Club Action
        </span>
      );
    }
    if (action.includes("membership") || action.includes("request")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Membership
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        System
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Audit Trail & Activity Logs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {logs.length} Entries
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of role updates, approval actions, and chapter modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
          >
            <option value="all">All Actions</option>
            <option value="role">Role Updates</option>
            <option value="event">Event Actions</option>
            <option value="club">Club Updates</option>
            <option value="membership">Memberships</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Action Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const detailsFormatted = log.details ? JSON.stringify(log.details) : "—";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div>{formatDate(log.created_at)}</div>
                        <div className="text-[10px] text-slate-400">{formatTime(log.created_at)}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {log.user?.full_name || "Admin Operator"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {log.user?.email || "system"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {getActionBadge(log.action)}
                          <span className="font-medium text-slate-700 text-[11px]">
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {log.target_type || "Global"}
                      </td>

                      <td className="py-3 px-4 text-slate-500 max-w-xs">
                        <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono line-clamp-1">
                          {detailsFormatted}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
