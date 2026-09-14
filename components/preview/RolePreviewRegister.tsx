"use client";

import React, { useState } from "react";
import { PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import { UserRole } from "@/types/database";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface RolePreviewRegisterProps {
  initialRole: PreviewRole;
  onContinueToDashboard: (selectedRole?: PreviewRole) => void;
  onSwitchToLogin: () => void;
}

const ROLE_OPTIONS: { label: string; value: PreviewRole }[] = [
  { label: "Student", value: "student" },
  { label: "Club Lead", value: "club_lead" },
  { label: "Faculty", value: "faculty" },
  { label: "Admin", value: "admin" },
];

export default function RolePreviewRegister({
  initialRole,
  onContinueToDashboard,
  onSwitchToLogin,
}: RolePreviewRegisterProps) {
  const meta = PREVIEW_ROLES[initialRole];

  const [fullName, setFullName] = useState(meta.defaultName);
  const [email, setEmail] = useState(meta.defaultEmail);
  const [selectedRole, setSelectedRole] = useState<PreviewRole>(initialRole);
  const [password, setPassword] = useState("DemoCampus2026!");
  const [confirmPassword, setConfirmPassword] = useState("DemoCampus2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setFeedback(`Simulating registration with role: ${PREVIEW_ROLES[selectedRole].label}...`);

    setTimeout(() => {
      setIsSimulating(false);
      onContinueToDashboard(selectedRole);
    }, 700);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-600">
            Join CampusHub to discover clubs, events, and student communities.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1 bg-blue-50/60 text-blue-800 border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulating: {meta.label} Registration</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

          {feedback && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">{feedback}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* 2. Personal Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Personal email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Use any valid personal email. A college email is not required.
              </p>
            </div>

            {/* 3. Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = selectedRole === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition select-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600/30"
                          : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="preview_role"
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => setSelectedRole(opt.value)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        required
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 5. Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 6. Submit Button */}
            <button
              type="submit"
              disabled={isSimulating}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning {PREVIEW_ROLES[selectedRole].label} Demo...</span>
                </>
              ) : (
                <>
                  <span>Create {PREVIEW_ROLES[selectedRole].label} Account (Demo)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                View Login UI
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
