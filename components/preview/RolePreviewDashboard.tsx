"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import {
  getMockStudentData,
  getMockClubLeadData,
  getMockFacultyData,
  getMockAdminData,
} from "@/lib/preview/mock-data";
import {
  Users,
  Calendar,
  Compass,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Building2,
  Award,
  GraduationCap,
  AlertCircle,
  FileCheck,
  Check,
} from "lucide-react";

interface RolePreviewDashboardProps {
  role: PreviewRole;
}

export default function RolePreviewDashboard({ role }: RolePreviewDashboardProps) {
  const meta = PREVIEW_ROLES[role];

  // Toast feedback state for simulated actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (role === "student") {
    return <StudentDashboardView showToast={showToast} toastMessage={toastMessage} />;
  }

  if (role === "club_lead") {
    return <ClubLeadDashboardView showToast={showToast} toastMessage={toastMessage} />;
  }

  if (role === "faculty") {
    return <FacultyDashboardView showToast={showToast} toastMessage={toastMessage} />;
  }

  return <AdminDashboardView showToast={showToast} toastMessage={toastMessage} />;
}

// ----------------------------------------------------
// 1. STUDENT DASHBOARD PREVIEW
// ----------------------------------------------------
function StudentDashboardView({
  showToast,
  toastMessage,
}: {
  showToast: (msg: string) => void;
  toastMessage: string | null;
}) {
  const data = getMockStudentData();
  const [pendingList, setPendingList] = useState(data.pendingRequests);

  const handleWithdraw = (id: string, name: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    showToast(`Withdrew membership application to ${name} (Simulated).`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {toastMessage && <DemoToast message={toastMessage} />}

      {/* Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            AR
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {data.profile.fullName}!
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                Student
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {data.profile.department} • {data.profile.yearOfStudy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={() => showToast("Opening club directory (Simulated)")}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Clubs</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Joined Clubs</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data.memberships.length}
          </div>
          <div className="text-[11px] text-slate-500">Active club memberships</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {pendingList.length}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting club leadership review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Upcoming Events</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data.upcomingEvents.length}
          </div>
          <div className="text-[11px] text-slate-500">Scheduled campus gatherings</div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Memberships */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>My Active Clubs</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {data.memberships.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{m.clubName}</div>
                    <div className="text-xs text-slate-500">
                      {m.role} • Joined {m.joinedAt}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>My Join Applications</span>
            </h2>

            {pendingList.length === 0 ? (
              <p className="text-sm text-slate-500">No pending club applications.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingList.map((req) => (
                  <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{req.clubName}</div>
                      <p className="text-xs text-slate-500 line-clamp-1">{req.message}</p>
                      <span className="text-[11px] text-slate-400">Submitted {req.submittedAt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleWithdraw(req.id, req.clubName)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition"
                    >
                      Withdraw
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Campus Events</span>
            </h2>

            <div className="space-y-3">
              {data.upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition space-y-1.5"
                >
                  <div className="font-semibold text-sm text-slate-900 leading-tight">
                    {evt.title}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">{evt.clubName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{evt.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. CLUB LEAD DASHBOARD PREVIEW
// ----------------------------------------------------
function ClubLeadDashboardView({
  showToast,
  toastMessage,
}: {
  showToast: (msg: string) => void;
  toastMessage: string | null;
}) {
  const data = getMockClubLeadData();
  const [requests, setRequests] = useState(data.pendingRequests);

  const handleAction = (id: string, name: string, approve: boolean) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`${approve ? "Approved" : "Declined"} ${name} for ${data.club.name} (Simulated).`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {toastMessage && <DemoToast message={toastMessage} />}

      {/* Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            MB
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {data.club.name} Dashboard
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                Club Lead
              </span>
            </div>
            <p className="text-sm text-slate-500">
              President: {data.profile.fullName} • {data.club.charterStatus}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast("Opening event creation form (Simulated)")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition"
        >
          <Calendar className="w-4 h-4" />
          <span>Publish Club Event</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data.club.memberCount}
          </div>
          <div className="text-[11px] text-slate-500">Registered club members</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Applications</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {requests.length}
          </div>
          <div className="text-[11px] text-slate-500">Pending review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Sub-Teams</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data.club.teamCount}
          </div>
          <div className="text-[11px] text-slate-500">Active working groups</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Events</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {data.club.eventsCount}
          </div>
          <div className="text-[11px] text-slate-500">Hosted this academic year</div>
        </div>
      </div>

      {/* Pending Membership Applications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Pending Membership Requests</span>
          </span>
          <span className="text-xs font-normal text-slate-400">
            {requests.length} awaiting decision
          </span>
        </h2>

        {requests.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            All membership requests have been reviewed!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((r) => (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{r.applicantName}</span>
                    <span className="text-xs text-slate-500">({r.applicantEmail})</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.department} • {r.yearOfStudy}
                  </div>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                    &ldquo;{r.message}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(r.id, r.applicantName, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(r.id, r.applicantName, false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <span>Club Working Groups</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.teams.map((tm) => (
            <div key={tm.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="font-semibold text-sm text-slate-900">{tm.name}</div>
              <div className="text-xs text-slate-500">Lead: {tm.leadName}</div>
              <div className="text-xs text-blue-600 font-medium">{tm.memberCount} members</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. FACULTY DASHBOARD PREVIEW
// ----------------------------------------------------
function FacultyDashboardView({
  showToast,
  toastMessage,
}: {
  showToast: (msg: string) => void;
  toastMessage: string | null;
}) {
  const data = getMockFacultyData();
  const [approvals, setApprovals] = useState(data.pendingEventApprovals);

  const handleApproval = (id: string, title: string, approve: boolean) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(`${approve ? "Approved" : "Requested modifications on"} event: ${title} (Simulated).`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {toastMessage && <DemoToast message={toastMessage} />}

      {/* Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            EV
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Faculty Governance Portal
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                Faculty Coordinator
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {data.profile.fullName} • {data.profile.department}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast("Exporting compliance audit summary (Simulated)")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition"
        >
          <FileCheck className="w-4 h-4" />
          <span>Annual Compliance Audit</span>
        </button>
      </div>

      {/* Assigned Clubs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          <span>Assigned Student Organizations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.assignedClubs.map((club) => (
            <div key={club.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">{club.name}</h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {club.charterStatus}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>Elected President: <span className="font-semibold text-slate-800">{club.presidentName}</span></div>
                <div>Active Student Members: <span className="font-semibold text-slate-800">{club.membersCount}</span></div>
                <div>Last Term Report: <span className="text-slate-500">{club.lastReportDate}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Event Approvals */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <span>Events Awaiting Faculty Approval</span>
        </h2>

        {approvals.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            All submitted events have been reviewed and approved!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {approvals.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-slate-900">{item.title}</div>
                  <div className="text-xs text-blue-600 font-medium">{item.clubName}</div>
                  <div className="text-xs text-slate-500">
                    Date: {item.eventDate} • Venue: {item.venue} • Expected: ~{item.expectedAttendees}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproval(item.id, item.title, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproval(item.id, item.title, false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                  >
                    <span>Request Changes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. ADMIN DASHBOARD PREVIEW
// ----------------------------------------------------
function AdminDashboardView({
  showToast,
  toastMessage,
}: {
  showToast: (msg: string) => void;
  toastMessage: string | null;
}) {
  const data = getMockAdminData();
  const [users, setUsers] = useState(data.recentUsers);

  const handleRoleChange = (id: string, name: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    showToast(`Updated ${name} to role "${newRole}" (Simulated - no DB records changed).`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {toastMessage && <DemoToast message={toastMessage} />}

      {/* Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            AD
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Administrator Control Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-red-50 text-red-700 border-red-200">
                Admin
              </span>
            </div>
            <p className="text-sm text-slate-500">
              CampusHub Governance & System Oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast("Database backup snapshot requested (Simulated)")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
          >
            System Health Check
          </button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Clubs</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{data.platformStats.totalClubs}</div>
          <div className="text-[11px] text-slate-400">Across 6 organizations</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Students</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{data.platformStats.totalUsers}</div>
          <div className="text-[11px] text-slate-400">Registered campus profiles</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Events Published</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{data.platformStats.totalEvents}</div>
          <div className="text-[11px] text-slate-400">Semester campus activity</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Pending Charters</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{data.platformStats.pendingCharters}</div>
          <div className="text-[11px] text-slate-400">Awaiting dean approval</div>
        </div>
      </div>

      {/* User Role Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>User Role Management (Simulated)</span>
          </h2>
          <span className="text-xs text-slate-400">Changes in demo mode do not modify database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">{u.department}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-800 border-slate-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, u.fullName, e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="club_lead">Club Lead</option>
                      <option value="faculty_coordinator">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Interactive demo toast
function DemoToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
