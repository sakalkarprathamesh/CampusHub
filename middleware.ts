import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = rawUrl ? rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "") : undefined;
  const key = rawKey ? rawKey.trim() : undefined;

  if (!url || !key || url.includes("PASTE_") || key.includes("PASTE_")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // If user is trying to access auth login/register while already logged in
  if (user && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Protected routes check
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/onboarding");

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-specific routing and protection for logged-in users
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "student";

    // Handle generic /dashboard redirect to appropriate role dashboard
    if (pathname === "/dashboard") {
      const targetUrl = request.nextUrl.clone();
      if (role === "admin") targetUrl.pathname = "/dashboard/admin";
      else if (role === "faculty_coordinator" || role === "faculty") targetUrl.pathname = "/dashboard/faculty";
      else if (role === "club_lead") targetUrl.pathname = "/dashboard/club";
      else targetUrl.pathname = "/dashboard/student";
      return NextResponse.redirect(targetUrl);
    }

    // Restrict Admin Dashboard
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = "/unauthorized";
      return NextResponse.redirect(targetUrl);
    }

    // Restrict Faculty Dashboard
    if (pathname.startsWith("/dashboard/faculty") && role !== "faculty_coordinator" && role !== "faculty" && role !== "admin") {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = "/unauthorized";
      return NextResponse.redirect(targetUrl);
    }

    // Restrict Club Lead Dashboard
    if (pathname.startsWith("/dashboard/club") && role !== "club_lead" && role !== "admin") {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = "/unauthorized";
      return NextResponse.redirect(targetUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
