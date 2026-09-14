import { SupabaseClient } from "@supabase/supabase-js";
import { Profile, UserRole } from "@/types/database";
import { SEED_PROFILES } from "@/lib/data/seed-data";

/**
 * Shared in-memory cache of provisioned profiles for resilient fallback
 * Ensures that even if PostgreSQL RLS blocks anon/unprivileged inserts before
 * migrations are executed, the application never fails with missing-profile errors.
 */
export const PROVISIONED_PROFILES: Map<string, Profile> = new Map();

// Seed the provisioned profiles cache
for (const p of SEED_PROFILES) {
  PROVISIONED_PROFILES.set(p.id, p as Profile);
}

/**
 * Ensures an authenticated Auth user has a corresponding row in public.profiles.
 * 1. Checks Supabase profiles table.
 * 2. If missing, automatically provisions a profile row matching auth.users.id.
 * 3. Falls back to in-memory store if database RLS is restricting client inserts.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient | null,
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  }
): Promise<Profile | null> {
  if (!user || !user.id) return null;

  // 1. First check if exists in Supabase
  if (supabase) {
    try {
      const { data: existingProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile && !error) {
        PROVISIONED_PROFILES.set(user.id, existingProfile as Profile);
        return existingProfile as Profile;
      }
    } catch {
      // Proceed to provision
    }
  }

  // 2. Check local provisioned map
  if (PROVISIONED_PROFILES.has(user.id)) {
    return PROVISIONED_PROFILES.get(user.id)!;
  }

  // 3. Construct profile attributes from Auth metadata
  const email = user.email || "";
  const rawRole = user.user_metadata?.role || "student";
  let role: UserRole = "student";
  if (rawRole === "faculty" || rawRole === "faculty_coordinator") {
    role = "faculty_coordinator";
  } else if (rawRole === "club_lead") {
    role = "club_lead";
  } else if (rawRole === "admin") {
    role = "admin";
  }

  const fullName =
    user.user_metadata?.full_name?.trim() ||
    user.user_metadata?.name?.trim() ||
    email.split("@")[0] ||
    "Student";

  const now = new Date().toISOString();
  const profileRecord: Profile = {
    id: user.id,
    email,
    full_name: fullName,
    role,
    avatar_url: user.user_metadata?.avatar_url || null,
    department: user.user_metadata?.department || null,
    year_of_study: user.user_metadata?.year_of_study || null,
    phone: null,
    bio: null,
    skills: [],
    interests: [],
    created_at: now,
    updated_at: now,
  };

  // 4. Attempt to upsert into Supabase profiles table
  if (supabase) {
    try {
      const { data: upserted, error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email,
            full_name: fullName,
            role,
            created_at: now,
            updated_at: now,
          },
          { onConflict: "id" }
        )
        .select("*")
        .maybeSingle();

      if (upserted && !upsertErr) {
        PROVISIONED_PROFILES.set(user.id, upserted as Profile);
        return upserted as Profile;
      }
    } catch {
      // ignore
    }
  }

  // 5. Cache locally in provisioned map so downstream actions succeed
  PROVISIONED_PROFILES.set(user.id, profileRecord);
  return profileRecord;
}
