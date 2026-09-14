"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Award,
  GraduationCap,
  Shield,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { PREVIEW_ROLES, PreviewRole } from "@/lib/preview/config";

const ROLE_CARDS: {
  role: PreviewRole;
  title: string;
  roleName: string;
  icon: React.ElementType;
  gradient: string;
  bgLight: string;
  textColor: string;
  badge: string;
}[] = [
  {
    role: "student",
    title: "Student Interface",
    roleName: "Student",
    icon: Compass,
    gradient: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-50/80",
    textColor: "text-blue-600",
    badge: "Student Community",
  },
  {
    role: "club_lead",
    title: "Club Lead Interface",
    roleName: "Club Lead",
    icon: Award,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50/80",
    textColor: "text-amber-600",
    badge: "Club Leadership",
  },
  {
    role: "faculty",
    title: "Faculty Interface",
    roleName: "Faculty",
    icon: GraduationCap,
    gradient: "from-purple-600 to-indigo-700",
    bgLight: "bg-purple-50/80",
    textColor: "text-purple-600",
    badge: "Academic Oversight",
  },
  {
    role: "admin",
    title: "Admin Interface",
    roleName: "Admin",
    icon: Shield,
    gradient: "from-red-600 to-rose-700",
    bgLight: "bg-red-50/80",
    textColor: "text-red-600",
    badge: "Platform Governance",
  },
];

export default function RolePreviewCenter() {
  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Developer Sandbox</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Role Preview Center
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Preview and test all four CampusHub user interfaces, login screens, registration flows, and dashboards without logging in and out.
          </p>
        </div>

        {/* Security / Demo Info Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">
                Safe UI Preview System
              </div>
              <p className="text-[11px] text-slate-500">
                Simulated client-side sandboxes. Real database data and user authentication sessions remain completely untouched.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            NEXT_PUBLIC_ENABLE_ROLE_PREVIEW=true
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Avatar / Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${card.bgLight} ${card.textColor} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title & Role Name */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {card.badge}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h2>
                    <div className="text-xs font-semibold text-slate-700">
                      Role: {card.roleName}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  <Link
                    href={`/role-preview/${card.role}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-medium rounded-xl transition shadow-sm"
                  >
                    <span>Preview Interface</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote & Exit Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200/80 text-xs text-slate-500">
          <div>
            CampusHub Role Preview Center • Temporary developer verification module
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-blue-600 transition"
          >
            <span>Return to CampusHub Home &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
