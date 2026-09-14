import { createSupabaseServerClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
