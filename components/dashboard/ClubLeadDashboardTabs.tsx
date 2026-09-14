"use client";

import { useState } from "react";
import Link from "next/link";
import { Club, Event, Announcement } from "@/types/database";
import ClubLeadRequestsManager, { ClubLeadRequest } from "@/components/dashboard/ClubLeadRequestsManager";
import ClubLeadMembersManager, { ClubMemberItem } from "@/components/dashboard/ClubLeadMembersManager";
import ClubLeadEventManager from "@/components/dashboard/ClubLeadEventManager";
import ClubLeadAnnouncementsManager from "@/components/dashboard/ClubLeadAnnouncementsManager";
import {
  Users,
  Clock,
  Calendar,
  Layers,
  Megaphone,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Props {
  pendingRequests: ClubLeadRequest[];
  membersList: ClubMemberItem[];
  eventsList: Event[];
  announcementsList: Announcement[];
  managedClubs: Club[];
  primaryClub?: Club;
  currentUserId: string;
  teamsCount: number;
}

export default function ClubLeadDashboardTabs({
  pendingRequests,
  membersList,
  eventsList,
  announcementsList,
  managedClubs,
  primaryClub,
  currentUserId,
  teamsCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "members" | "events" | "announcements">("overview");

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
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
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "requests"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Applications</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "members"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Member Roster</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {membersList.length}
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
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Events</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
            {eventsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "announcements"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Megaphone className="w-4 h-4 text-indigo-600" />
          <span>Broadcasts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
            {announcementsList.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab("members")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Club Members</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {membersList.length}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Active roster</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("requests")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-amber-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Pending Applicants</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {pendingRequests.length}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold flex items-center justify-between">
                <span>Awaiting review</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("events")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-purple-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Club Events</span>
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {eventsList.length}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Workshops & hackathons</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab("announcements")}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 cursor-pointer hover:border-indigo-300 transition"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
                <span>Broadcasts</span>
                <Megaphone className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {announcementsList.length}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Member bulletins</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Pending Applications Callout if any */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Students are waiting for your approval!
                  </h3>
                  <p className="text-xs text-slate-600">
                    Review applicant profiles, motivation notes, and approve or reject with feedback.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Review Applications &rarr;
              </button>
            </div>
          )}

          {/* Dual Split: Recent Announcements & Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Announcements preview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  <span>Latest Broadcasts</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Manage All &rarr;
                </button>
              </div>

              {announcementsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No broadcasts posted yet.</p>
              ) : (
                <div className="space-y-2">
                  {announcementsList.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{ann.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events preview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Recent Events</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("events")}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                  Manage Events &rarr;
                </button>
              </div>

              {eventsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No events created yet.</p>
              ) : (
                <div className="space-y-2">
                  {eventsList.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{ev.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold capitalize">
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{ev.venue} • Capacity: {ev.capacity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MEMBERSHIP APPLICATIONS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Student Membership Applications ({pendingRequests.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Review prospective member credentials, accept to admit, or provide constructive rejection feedback.
              </p>
            </div>
          </div>

          <ClubLeadRequestsManager initialRequests={pendingRequests} />
        </div>
      )}

      {/* TAB CONTENT: ACTIVE MEMBER ROSTER */}
      {activeTab === "members" && (
        <ClubLeadMembersManager
          initialMembers={membersList}
          clubId={primaryClub?.id || managedClubs[0]?.id || ""}
          currentUserId={currentUserId}
        />
      )}

      {/* TAB CONTENT: EVENTS MANAGEMENT */}
      {activeTab === "events" && (
        <ClubLeadEventManager
          initialEvents={eventsList}
          managedClubs={managedClubs}
          currentUserId={currentUserId}
        />
      )}

      {/* TAB CONTENT: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <ClubLeadAnnouncementsManager
          initialAnnouncements={announcementsList}
          managedClubs={managedClubs}
        />
      )}
    </div>
  );
}
