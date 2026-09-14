import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

// Unauthenticated client for public seed/static data queries
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
        // No-op for unauthenticated public reads
      },
    },
    global: {
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          signal: init?.signal || AbortSignal.timeout(8000),
        });
      },
    },
  });
}

// Authenticated client using request cookies for Server Components and Server Actions
export async function createSupabaseServerClient() {
  if (!supabaseConfig.isConfigured || !supabaseConfig.url || !supabaseConfig.key) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be safely ignored if middleware refreshes user sessions
        }
      },
    },
    global: {
      fetch: (input, init) => {
        return fetch(input, {
          ...init,
          signal: init?.signal || AbortSignal.timeout(8000),
        });
      },
    },
  });
}

