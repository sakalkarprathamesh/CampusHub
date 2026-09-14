"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ROLE_CONFIGS, getRoleBadgeClass, getRoleLabel } from "@/lib/auth/roles";
import { UserRole, Profile } from "@/types/database";
import { sanitizeDatabaseError } from "@/lib/errors";
import { registerProfileAfterSignupAction } from "@/lib/auth/actions";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Phone,
  FileText,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Tag,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isNeedsCompletion, setIsNeedsCompletion] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirectTo=/profile");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      let extendedData: { phone?: string; bio?: string; skills?: string[]; interests?: string[] } = {};
      try {
        const cached = localStorage.getItem(`campushub_profile_ext_${user.id}`);
        if (cached) extendedData = JSON.parse(cached);
      } catch {}

      if (prof) {
        const mergedPhone = prof.phone || extendedData.phone || "";
        const mergedBio = prof.bio || extendedData.bio || "";
        const mergedSkills = prof.skills && prof.skills.length > 0 ? prof.skills : extendedData.skills || [];
        const mergedInterests = prof.interests && prof.interests.length > 0 ? prof.interests : extendedData.interests || [];

        setProfile({
          ...prof,
          phone: mergedPhone,
          bio: mergedBio,
          skills: mergedSkills,
          interests: mergedInterests,
        } as Profile);
        setFullName(prof.full_name || "");
        setDepartment(prof.department || "");
        setYearOfStudy(prof.year_of_study || "");
        setPhone(mergedPhone);
        setBio(mergedBio);
        setSkills(mergedSkills);
        setInterests(mergedInterests);
      } else {
        // Fallback profile object for user accounts missing a profile row
        const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
        const fallbackRole = (user.user_metadata?.role as UserRole) || "student";
        const p: Profile = {
          id: user.id,
          email: user.email || "",
          full_name: fallbackName,
          avatar_url: null,
          department: null,
          year_of_study: null,
          phone: extendedData.phone || null,
          bio: extendedData.bio || null,
          skills: extendedData.skills || [],
          interests: extendedData.interests || [],
          role: fallbackRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(p);
        setFullName(p.full_name);
        setPhone(extendedData.phone || "");
        setBio(extendedData.bio || "");
        setSkills(extendedData.skills || []);
        setInterests(extendedData.interests || []);
        setIsNeedsCompletion(true);

        // Auto-provision server-side to guarantee row exists
        registerProfileAfterSignupAction(user.id, user.email || "", fallbackName, fallbackRole).catch(() => {});
      }
      setIsLoading(false);
    }

    loadData();
  }, [router]);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newInterest.trim()) {
      e.preventDefault();
      if (!interests.includes(newInterest.trim())) {
        setInterests([...interests, newInterest.trim()]);
      }
      setNewInterest("");
    }
  };

  const removeInterest = (it: string) => {
    setInterests(interests.filter((i) => i !== it));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !profile) return;

      // Always save extended attributes to local cache so user edits are instantly preserved
      try {
        localStorage.setItem(
          `campushub_profile_ext_${profile.id}`,
          JSON.stringify({
            phone: phone.trim() || null,
            bio: bio.trim() || null,
            skills,
            interests,
          })
        );
      } catch {}

      // Attempt full upsert in Supabase (creates row if missing, updates if existing)
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            full_name: fullName.trim(),
            department: department.trim() || null,
            year_of_study: yearOfStudy.trim() || null,
            phone: phone.trim() || null,
            bio: bio.trim() || null,
            skills,
            interests,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      // Also ensure server action synchronizes profile
      await registerProfileAfterSignupAction(profile.id, profile.email, fullName.trim(), profile.role);

      if (error) {
        // If error is due to missing columns or schema cache sync
        const isColumnOrSchema =
          error.code === "PGRST204" ||
          error.code === "PGRST205" ||
          error.message?.includes("column") ||
          error.message?.includes("schema cache") ||
          error.message?.includes("Could not find the");

        if (isColumnOrSchema) {
          // Fallback: upsert standard core columns in Supabase
          const { error: coreError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                full_name: fullName.trim(),
                department: department.trim() || null,
                year_of_study: yearOfStudy.trim() || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );

          if (coreError) {
            setFeedback({
              type: "error",
              text: sanitizeDatabaseError(coreError).userMessage,
            });
            return;
          }

          // Core columns updated in DB, extended columns preserved in local cache
          setFeedback({
            type: "success",
            text: "Profile details successfully updated!",
          });
          setIsNeedsCompletion(false);
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  full_name: fullName.trim(),
                  department: department.trim() || null,
                  year_of_study: yearOfStudy.trim() || null,
                  phone: phone.trim() || null,
                  bio: bio.trim() || null,
                  skills,
                  interests,
                }
              : null
          );
          router.refresh();
          return;
        }

        setFeedback({
          type: "error",
          text: sanitizeDatabaseError(error).userMessage,
        });
      } else {
        setFeedback({ type: "success", text: "Profile details successfully updated!" });
        setIsNeedsCompletion(false);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                full_name: fullName.trim(),
                department: department.trim() || null,
                year_of_study: yearOfStudy.trim() || null,
                phone: phone.trim() || null,
                bio: bio.trim() || null,
                skills,
                interests,
              }
            : null
        );
        router.refresh();
      }
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setIsUpdatingPassword(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsUpdatingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);

    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setNewPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  const role = profile?.role || "student";
  const roleBadge = getRoleBadgeClass(role);
  const roleLabel = getRoleLabel(role);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {fullName.slice(0, 2).toUpperCase() || "CH"}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{fullName || "Student Profile"}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadge}`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{profile?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Role changes managed by Campus Administration</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          )}
          <div className="font-medium">{feedback.text}</div>
        </div>
      )}

      {isNeedsCompletion && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-sm text-blue-950">Complete Your Campus Profile</div>
            <p className="text-blue-800 leading-relaxed">
              Your account is authenticated, but your profile needs to be initialized. Please confirm your details below and click <strong>Save Changes</strong> to enable official club memberships and event registration passes.
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Information</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Mechanical Eng."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Year of Study
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    >
                      <option value="">Select year</option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                      <option value="PhD">PhD</option>
                      <option value="Faculty">Faculty Staff</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell campus clubs about your interests, previous project experiences, or what you hope to learn..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skills & Technical Competencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-slate-400">No skills added yet.</span>
                  )}
                </div>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill and press Enter (e.g., Python, Event Planning)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Interests & Hobbies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:text-red-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {interests.length === 0 && (
                    <span className="text-xs text-slate-400">No interests added yet.</span>
                  )}
                </div>
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={handleAddInterest}
                  placeholder="Type an interest and press Enter (e.g., Robotics, Photography)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Security & Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Change Password</span>
            </h2>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition disabled:opacity-50"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Role Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Assigned Role</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Role Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${roleBadge}`}>
                  {roleLabel}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {ROLE_CONFIGS[role]?.description || "Standard campus user privileges."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
