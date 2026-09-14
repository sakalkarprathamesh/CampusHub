"use client";

import { useState } from "react";
import { Club, Event, Profile, AdminActivityLog } from "@/types/database";
import AdminClubManager from "@/components/dashboard/AdminClubManager";
import AdminEventManager from "@/components/dashboard/AdminEventManager";
import AdminMembershipManager, { AdminMembershipRequest } from "@/components/dashboard/AdminMembershipManager";
import AdminUserRoleManager from "@/components/dashboard/AdminUserRoleManager";
import AdminActivityLogViewer from "@/components/dashboard/AdminActivityLogViewer";
import AdminHealthCheck from "@/components/dashboard/AdminHealthCheck";
import { DatabaseStatus } from "@/lib/data";
import {
  LayoutDashboard,
  Building,
  Calendar,
  Users,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
  Database,
} from "lucide-react";

interface Props {
  clubs: Club[];
  events: Event[];
  profiles: Profile[];
  requests: AdminMembershipRequest[];
  logs: AdminActivityLog[];
  currentAdminId: string;
  stats: {
    totalClubs: number;
    totalOrganizations: number;
    upcomingEventsCount: number;
    totalMembers: number;
  };
  dbStatus?: DatabaseStatus;
}

export default function AdminDashboardTabs({
  clubs,
  events,
  profiles,
  requests,
  logs,
  currentAdminId,
  stats,
  dbStatus,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "clubs" | "events" | "memberships" | "roles" | "logs" | "health"
  >("overview");

  const facultyProfiles = profiles.filter(
    (p) => p.role === "faculty_coordinator" || p.role === "admin"
  );
  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;
  const pendingEventsCount = events.filter(
    (e) => e.status === "pending_approval" || e.status === "submitted"
  ).length;

  return (
    <div className="space-y-6">
      {/* Tab Selector Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("clubs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "clubs"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Building className="w-4 h-4 text-purple-600" />
          <span>Clubs</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
            {clubs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "events"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Events</span>
          {pendingEventsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingEventsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("memberships")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "memberships"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>Memberships</span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "roles"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Shield className="w-4 h-4 text-red-600" />
          <span>User Roles</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {profiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "logs"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Audit Logs</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
            {logs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("health")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "health"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>System Health</span>
          {dbStatus && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                dbStatus.tableResults?.every((t) => t.status === "ok")
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {dbStatus.tableResults?.filter((t) => t.status === "ok").length || 0}/10
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div
              onClick={() => setActiveTab("roles")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Total Profiles</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {profiles.length || stats.totalMembers}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Registered accounts</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("clubs")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-purple-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Campus Clubs</span>
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{clubs.length}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Student organizations</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("events")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Campus Events</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{events.length}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Published & pending</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("memberships")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-amber-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Pending Requests</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {pendingRequestsCount}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold flex items-center justify-between">
                <span>Applications to review</span>
                <ChevronRight className="w-3 h-3 text-amber-500" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("logs")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-indigo-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Audit Logs</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{logs.length}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Recorded actions</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Dual Split: Recent Audit Log snippet & Pending Events callout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Recent Platform Activity</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("logs")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View Full Trail &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {logs.slice(0, 4).map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">
                        {l.action.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        By {l.user?.full_name || "Admin"} • {new Date(l.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      {l.target_type || "System"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>Registered Chapters Snapshot</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("clubs")}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                  Manage All &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {clubs.slice(0, 4).map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.category}</div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        c.is_active && c.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Database Health Section in Overview */}
          {dbStatus && (
            <div className="pt-2">
              <AdminHealthCheck dbStatus={dbStatus} />
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CLUBS */}
      {activeTab === "clubs" && (
        <AdminClubManager initialClubs={clubs} facultyMembers={facultyProfiles} />
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === "events" && <AdminEventManager initialEvents={events} />}

      {/* TAB CONTENT: MEMBERSHIPS */}
      {activeTab === "memberships" && (
        <AdminMembershipManager initialRequests={requests} />
      )}

      {/* TAB CONTENT: USER ROLES */}
      {activeTab === "roles" && (
        <AdminUserRoleManager initialUsers={profiles} currentAdminId={currentAdminId} />
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {activeTab === "logs" && <AdminActivityLogViewer initialLogs={logs} />}

      {/* TAB CONTENT: DATABASE HEALTH */}
      {activeTab === "health" && dbStatus && (
        <div className="space-y-4">
          <AdminHealthCheck dbStatus={dbStatus} showSqlGuide={true} />
        </div>
      )}
    </div>
  );
}
