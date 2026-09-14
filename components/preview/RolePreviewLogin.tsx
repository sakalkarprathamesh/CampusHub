"use client";

import React, { useState } from "react";
import { PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface RolePreviewLoginProps {
  role: PreviewRole;
  onContinueToDashboard: () => void;
  onSwitchToRegister: () => void;
}

export default function RolePreviewLogin({
  role,
  onContinueToDashboard,
  onSwitchToRegister,
}: RolePreviewLoginProps) {
  const meta = PREVIEW_ROLES[role];

  const [email, setEmail] = useState(meta.defaultEmail);
  const [password, setPassword] = useState("DemoCampus2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setFeedback(`Simulating sign-in as ${meta.label}...`);

    setTimeout(() => {
      setIsSimulating(false);
      onContinueToDashboard();
    }, 700);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mb-2">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back to CampusHub.
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to discover clubs, events, and student communities.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1 bg-blue-50/60 text-blue-800 border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulating: {meta.label} Login</span>
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

          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Demo Persona</span>
              <span className="text-blue-600 font-bold">{meta.label}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Demo credentials are pre-populated below. You can edit them or proceed directly to preview the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
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
                  placeholder="Enter personal email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-400 cursor-not-allowed">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading {meta.label} Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Continue to {meta.label} Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration toggle link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Want to test registration instead?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                View Registration UI
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
