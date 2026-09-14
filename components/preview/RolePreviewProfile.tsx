"use client";

import React, { useState } from "react";
import { PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import { User, Mail, Sparkles, CheckCircle2, Shield, BookOpen } from "lucide-react";

interface RolePreviewProfileProps {
  role: PreviewRole;
}

export default function RolePreviewProfile({ role }: RolePreviewProfileProps) {
  const meta = PREVIEW_ROLES[role];

  const [fullName, setFullName] = useState(meta.defaultName);
  const [department, setDepartment] = useState(meta.defaultDepartment);
  const [yearOfStudy, setYearOfStudy] = useState("Senior (Year 4)");
  const [bio, setBio] = useState(
    `Active campus participant exploring clubs, governance, and events as ${meta.label}.`
  );
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(`Profile details updated for ${fullName} (Simulated - no DB records changed).`);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            {fullName ? fullName.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{fullName}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${meta.badgeColor}`}>
                {meta.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">{meta.defaultEmail}</p>
            <div className="text-xs text-slate-600 font-medium">{department}</div>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
          Demo Profile View
        </span>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>Edit Profile Information</span>
        </h2>

        {savedFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedFeedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department / School
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
            >
              Save Profile (Simulated)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
