import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("PASTE_") &&
  !supabaseAnonKey.includes("PASTE_")
);

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op in Phase 1 (no authentication session cookies yet)
      },
    },
  });
}
