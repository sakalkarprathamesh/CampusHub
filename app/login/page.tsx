"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase client is not configured. Check environment variables.");
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Fetch role to determine optimal redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        let target = redirectTo;
        if (!redirectTo || redirectTo === "/dashboard") {
          switch (profile?.role) {
            case "admin":
              target = "/dashboard/admin";
              break;
            case "faculty_coordinator":
              target = "/dashboard/faculty";
              break;
            case "club_lead":
              target = "/dashboard/club";
              break;
            default:
              target = "/dashboard/student";
              break;
          }
        }

        router.push(target);
        router.refresh();
      }
    });
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mb-2">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign In to CampusHub
          </h1>
          <p className="text-sm text-slate-600">
            Connect to your student organizations, leadership dashboards, and campus events.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Email Address
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
                  placeholder="student@campushub.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Test Helper Card */}
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Phase 2 Quick-Fill Test Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoFill("student@campushub.edu", "CampusStudent2026!")}
              className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              <div className="font-medium text-slate-800">Student</div>
              <div className="text-[11px] text-slate-500 truncate">student@campushub.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("lead@campushub.edu", "CampusLead2026!")}
              className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              <div className="font-medium text-slate-800">Club Lead</div>
              <div className="text-[11px] text-slate-500 truncate">lead@campushub.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("faculty@campushub.edu", "CampusFaculty2026!")}
              className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              <div className="font-medium text-slate-800">Faculty</div>
              <div className="text-[11px] text-slate-500 truncate">faculty@campushub.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("admin@campushub.edu", "CampusAdmin2026!")}
              className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              <div className="font-medium text-slate-800">Admin</div>
              <div className="text-[11px] text-slate-500 truncate">admin@campushub.edu</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
