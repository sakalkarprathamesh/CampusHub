"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import {
  Eye,
  LogOut,
  LayoutDashboard,
  LogIn,
  UserPlus,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export type PreviewView = "dashboard" | "login" | "register" | "profile";

interface RolePreviewBannerProps {
  currentRole: PreviewRole;
  currentView: PreviewView;
  onViewChange: (view: PreviewView) => void;
  onRoleChange: (role: PreviewRole) => void;
}

export default function RolePreviewBanner({
  currentRole,
  currentView,
  onViewChange,
  onRoleChange,
}: RolePreviewBannerProps) {
  const router = useRouter();
  const meta = PREVIEW_ROLES[currentRole];

  const handleExit = () => {
    router.push("/role-preview");
  };

  const navTabs: { id: PreviewView; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "login", label: "Login UI", icon: LogIn },
    { id: "register", label: "Registration UI", icon: UserPlus },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Badge & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <span>Demo Preview Mode —</span>
              <span className="text-blue-400 font-extrabold underline decoration-blue-500/50 decoration-2 underline-offset-4">
                {meta.label}
              </span>
            </div>
          </div>

          <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Mock Sandbox
          </span>
        </div>

        {/* Center: Role Switcher Shortcut */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          {(["student", "club_lead", "faculty", "admin"] as PreviewRole[]).map((r) => {
            const isCurrent = currentRole === r;
            const rMeta = PREVIEW_ROLES[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => onRoleChange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {rMeta.label}
              </button>
            );
          })}
        </div>

        {/* Right: Exit Preview Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Preview</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Row */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-1.5 overflow-x-auto gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onViewChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                    isActive
                      ? "bg-slate-800 text-blue-400 font-semibold border border-blue-500/30 shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulated UI • No emails sent • Database untouched</span>
          </div>
        </div>
      </div>
    </div>
  );
}
