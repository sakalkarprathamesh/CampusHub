"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { UserRole } from "@/types/database";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import { registerProfileAfterSignupAction } from "@/lib/auth/actions";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  LogIn,
  KeyRound,
} from "lucide-react";

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: "Student", value: "student" },
  { label: "Club Lead", value: "club_lead" },
  { label: "Faculty", value: "faculty_coordinator" },
  { label: "Admin", value: "admin" },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [role, setRole] = useState<UserRole>("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-level error messages
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Existing account detection
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);

  // Email confirmation pending state
  const [isRegisteredPendingConfirmation, setIsRegisteredPendingConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Resend confirmation email state
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const [isPending, startTransition] = useTransition();

  // 60-second cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setExistingAccountEmail(null);
    setResendSuccess(null);
    setResendError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const newErrors: typeof errors = {};

    if (!trimmedName) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!role) {
      newErrors.role = "Please select a role.";
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setErrors({ general: "Unable to connect. Please try again." });
        return;
      }

      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
              role: role,
            },
          },
        });

        // Detect if user already exists
        const isAlreadyRegistered =
          Boolean(
            signUpError && (
              signUpError.message.toLowerCase().includes("already registered") ||
              signUpError.message.toLowerCase().includes("already exists") ||
              (signUpError as any).status === 422
            )
          ) ||
          Boolean(
            data?.user &&
            Array.isArray(data.user.identities) &&
            data.user.identities.length === 0
          );

        if (isAlreadyRegistered) {
          setExistingAccountEmail(trimmedEmail);
          return;
        }

        if (signUpError) {
          const msg = signUpError.message.toLowerCase();
          if (msg.includes("valid email") || msg.includes("invalid email")) {
            setErrors({ email: "Please enter a valid email address." });
          } else if (msg.includes("password")) {
            setErrors({ password: signUpError.message });
          } else {
            setErrors({ general: signUpError.message });
          }
          return;
        }

        // Upsert matching profile record with selected role
        if (data.user) {
          try {
            await registerProfileAfterSignupAction(data.user.id, trimmedEmail, trimmedName, role);
          } catch {
            // DB trigger acts as backup
          }
        }

        // Follow current Supabase email-confirmation setting
        if (!data.session) {
          // Email confirmation is required
          setRegisteredEmail(trimmedEmail);
          setIsRegisteredPendingConfirmation(true);
        } else {
          // Auto-confirmed / confirmation turned off
          router.push(getDashboardPathForRole(role));
          router.refresh();
        }
      } catch {
        setErrors({ general: "Unable to connect. Please try again." });
      }
    });
  };

  const handleResendConfirmation = async () => {
    if (cooldownSeconds > 0 || isResending) return;

    const targetEmail = (registeredEmail || email).trim();
    if (!targetEmail || !validateEmail(targetEmail)) {
      setResendError("Please enter a valid email address.");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(null);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setResendError("Unable to connect. Please try again.");
        setIsResending(false);
        return;
      }

      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
      });

      setIsResending(false);

      if (resendErr) {
        setResendError(resendErr.message);
      } else {
        setResendSuccess("A new confirmation email has been requested. Please check your inbox and spam folder.");
        setCooldownSeconds(60);
      }
    } catch {
      setIsResending(false);
      setResendError("Unable to connect. Please try again.");
    }
  };

  // 1. Email confirmation pending screen
  if (isRegisteredPendingConfirmation) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mx-auto">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Check Your Email
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your account was created. Please check your email and click the confirmation link before logging in.
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-700">
            {registeredEmail}
          </div>
        </div>

        {resendSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 text-left">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 font-medium">{resendSuccess}</div>
          </div>
        )}

        {resendError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 font-medium">{resendError}</div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={cooldownSeconds > 0 || isResending}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-medium rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
            <span>
              {isResending
                ? "Resending confirmation email..."
                : cooldownSeconds > 0
                ? `Resend confirmation email (${cooldownSeconds}s)`
                : "Resend confirmation email"}
            </span>
          </button>

          <Link
            href={`/login?email=${encodeURIComponent(registeredEmail)}`}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Didn&apos;t receive an email? Check your spam folder or click Resend confirmation email above.
        </p>
      </div>
    );
  }

  // 2. Standard registration form
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Existing account detected alert */}
      {existingAccountEmail && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold text-sm">
                An account with this email already exists. Please log in instead.
              </p>
              <p className="text-xs text-amber-700 mt-0.5 font-mono">
                {existingAccountEmail}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <Link
              href={`/login?email=${encodeURIComponent(existingAccountEmail)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Go to Login</span>
            </Link>
            <Link
              href={`/forgot-password?email=${encodeURIComponent(existingAccountEmail)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 font-medium rounded-lg text-xs transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Forgot Password</span>
            </Link>
          </div>
        </div>
      )}

      {/* General server error */}
      {errors.general && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 font-medium">{errors.general}</div>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
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
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="Alex Rivera"
              autoComplete="name"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.fullName
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName}</p>
          )}
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (existingAccountEmail) setExistingAccountEmail(null);
              }}
              placeholder="alex.rivera@gmail.com"
              autoComplete="email"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-500">
              Use any valid personal email. A college email is not required.
            </p>
          )}
        </div>

        {/* 3. Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = role === opt.value;
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
                    name="role"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => {
                      setRole(opt.value);
                      if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.role}</p>
          )}
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.password
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
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
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
          )}
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
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.confirmPassword
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
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
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
          )}
        </div>

        {/* 6. Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
        </div>

        <Suspense fallback={<div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center text-slate-400 text-sm">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
