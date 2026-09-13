import { createServerClient } from "@supabase/ssr";

function getCleanSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Clean trailing slashes or subpaths without guessing or mutating valid URLs
  const url = rawUrl
    ? rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "")
    : undefined;
  const key = rawKey ? rawKey.trim() : undefined;

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes("PASTE_") &&
    !key.includes("PASTE_")
  );

  let hostname: string | null = null;
  if (url) {
    try {
      hostname = new URL(url).hostname;
    } catch {
      hostname = "invalid-url-format";
    }
  }

  return {
    url,
    key,
    hostname,
    isConfigured,
    urlExists: Boolean(rawUrl && rawUrl.trim().length > 0),
    keyExists: Boolean(rawKey && rawKey.trim().length > 0),
  };
}

export const supabaseConfig = getCleanSupabaseConfig();
export const isSupabaseConfigured = supabaseConfig.isConfigured;

export function getSupabaseServerClient() {
  if (!supabaseConfig.isConfigured || !supabaseConfig.url || !supabaseConfig.key) {
    return null;
  }

  return createServerClient(supabaseConfig.url, supabaseConfig.key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op in Phase 1 (no authentication session cookies yet)
      },
    },
    global: {
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          // Safe 8-second timeout to prevent SSR hanging on network issues
          signal: init?.signal || AbortSignal.timeout(8000),
        });
      },
    },
  });
}
