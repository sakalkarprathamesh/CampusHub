"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Calendar,
  Layers,
  Info,
  Menu,
  X,
  Lock,
  Search,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/clubs", label: "Clubs", icon: Layers },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
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

            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>Login</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                Phase 2
              </span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg"
            >
              Login
            </button>
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
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
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
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/clubs"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-medium"
              >
                <Search className="h-4 w-4" />
                Search Directory
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Login Coming Soon Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Student & Faculty Portal"
        description="Single Sign-On (SSO) & Role-Based Access"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <p className="font-semibold text-blue-950 mb-1">
                Phase 1 Prototype Notice
              </p>
              Direct student authentication, club lead dashboards, and faculty approval workflows will go live in <strong>Phase 2</strong>. In this release, you can freely browse organizations, explore clubs, inspect team hierarchies, and preview upcoming events.
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="font-medium text-slate-900">Upcoming Portal Features:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>MIT-ADT University Email SSO Authentication</li>
              <li>President & Vice President Event Proposal Workspace</li>
              <li>Faculty Coordinator One-Click Budget Approvals</li>
              <li>Dynamic QR Attendance & Digital Student Passes</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setAuthModalOpen(false)}
            >
              Got it, continue exploring
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
