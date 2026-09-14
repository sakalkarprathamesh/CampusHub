"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Calendar,
  Layers,
  Info,
  Menu,
  X,
  Search,
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
  Shield,
  Award,
  GraduationCap,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getRoleBadgeClass, getRoleLabel, getDashboardPathForRole } from "@/lib/auth/roles";
import { Profile, UserRole } from "@/types/database";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch auth session & profile
  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    async function loadUser() {
      if (!client) return;
      const {
        data: { user: authUser },
      } = await client.auth.getUser();

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email });

        // Fetch profile
        const { data: prof } = await client
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (prof) setProfile(prof as Profile);

        // Fetch unread count
        const { count } = await client
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", authUser.id)
          .eq("is_read", false);

        setUnreadCount(count || 0);
      } else {
        setUser(null);
        setProfile(null);
        setUnreadCount(0);
      }
    }

    loadUser();

    // Subscribe to auth state change
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setUser(null);
        setProfile(null);
        setUnreadCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setProfileDropdownOpen(false);
      router.push("/login");
      router.refresh();
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/clubs", label: "Clubs", icon: Layers },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Info },
  ];

  if (user) {
    const dashHref = getDashboardPathForRole(profile?.role);
    navLinks.push({ href: dashHref, label: "Dashboard", icon: LayoutDashboard });
  }

  const role = profile?.role || "student";
  const roleBadge = getRoleBadgeClass(role);
  const roleLabel = getRoleLabel(role);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
              Campus<span className="text-blue-600">Hub</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
              MIT-ADT University
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/clubs"
            className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search directory...</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Notifications Icon */}
              <Link
                href="/notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {profile?.full_name || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-slate-900 truncate">
                        {profile?.full_name || "User"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1.5">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${roleBadge}`}>
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getDashboardPathForRole(role)}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/notifications"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-slate-500" />
                          <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <Link
              href="/notifications"
              className="relative p-1.5 rounded-lg text-slate-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          {user && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-2">
              <div className="font-bold text-sm text-slate-900">{profile?.full_name || "User"}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${roleBadge}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}

          {user ? (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 bg-slate-100 text-slate-800 font-medium text-xs rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 bg-blue-600 text-white font-medium text-xs rounded-xl shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
