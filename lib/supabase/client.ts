import { createBrowserClient } from "@supabase/ssr";

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

export const supabaseBrowserConfig = getCleanSupabaseConfig();
export const isSupabaseConfigured = supabaseBrowserConfig.isConfigured;

export function getSupabaseBrowserClient() {
  if (
    !supabaseBrowserConfig.isConfigured ||
    !supabaseBrowserConfig.url ||
    !supabaseBrowserConfig.key
  ) {
    return null;
  }
  return createBrowserClient(supabaseBrowserConfig.url, supabaseBrowserConfig.key);
}

// Backward-compatible alias
export const getSupabaseClient = getSupabaseBrowserClient;
