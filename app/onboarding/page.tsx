"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Sparkles, Check, ArrowRight, BookOpen, Compass } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const POPULAR_SKILLS = [
    "Python",
    "JavaScript",
    "Public Speaking",
    "Event Management",
    "Graphic Design",
    "Robotics",
    "Budgeting",
    "Content Writing",
  ];

  const POPULAR_INTERESTS = [
    "Artificial Intelligence",
    "Web Development",
    "Robotics & Hardware",
    "Entrepreneurship",
    "Community Service",
    "Debate & MUN",
    "Photography & Media",
    "Music & Arts",
  ];

  useEffect(() => {
    async function loadProfile() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setDepartment(profile.department || "");
        setYearOfStudy(profile.year_of_study || "");
        setBio(profile.bio || "");
        setSkills(profile.skills || []);
        setInterests(profile.interests || []);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const addCustomInterest = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && interestInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) {
        setInterests([...interests, interestInput.trim()]);
      }
      setInterestInput("");
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          department: department || null,
          year_of_study: yearOfStudy || null,
          bio: bio || null,
          skills,
          interests,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      router.push("/dashboard/student");
      router.refresh();
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Setting up your campus profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Welcome to CampusHub!</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Personalize Your Campus Profile
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Share your academic background and interests to help club leaders find you and match you with relevant activities.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
        <form onSubmit={handleComplete} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                <option value="">Select year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quick Bio
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionate about open source and web tech..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Areas of Interest (Select or type below)
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_INTERESTS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {interest}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={addCustomInterest}
              placeholder="Type custom interest and press Enter..."
              className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Skills & Expertise (Select or type below)
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selected
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {skill}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addCustomSkill}
              placeholder="Type custom skill and press Enter..."
              className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/dashboard/student")}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Skip and go to Dashboard &rarr;
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Profile & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
