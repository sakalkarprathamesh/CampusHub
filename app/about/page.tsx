import React from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck2,
  QrCode,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "About CampusHub — College Club Operating System",
  description:
    "Learn how CampusHub centralizes club discovery, organizational hierarchy, events, and future approvals at MIT-ADT University.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumbs items={[{ label: "About CampusHub" }]} className="mb-4" />
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-blue-500/20">
            C
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              About CampusHub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              The centralized student community and club management platform for MIT-ADT University.
            </p>
          </div>
        </div>
      </div>

      {/* 1. PURPOSE & PROBLEM STATEMENT */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
          <Compass className="h-3.5 w-3.5" />
          <span>The Vision</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Why College Club Management Needs a Unified Platform
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          Modern university campuses thrive on student engagement, clubs, hackathons, and cultural societies. However, critical organizational information—such as club executive leadership, specialized functional teams, upcoming schedules, and faculty mentorship—often remains fragmented across disparate chat groups, posters, and unindexed social media handles.
        </p>

        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>CampusHub</strong> is engineered to serve as a comprehensive <em>Campus Operating System</em>. It brings structured organizational hierarchy, relational data integrity, transparent student leadership roles, and streamlined event execution into one unified, intuitive platform.
        </p>
      </section>

      {/* 2. PHASE 1 ARCHITECTURE & CAPABILITIES */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Current Release
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Phase 1 Scope & Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-quality local prototype built on real relational schema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Relational PostgreSQL Integration</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Real database schema spanning profiles, organizations, clubs, club members, teams, team members, and events with UUIDs and foreign key constraints.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Hierarchical Organizational Directory</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Clear visibility into governing bodies (e.g. Student Council, Technical Community) and their constituent chapters.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Club Leadership & Team Breakdowns</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Dedicated profile cards for Presidents, Vice Presidents, Faculty Coordinators, and specialized team leads (Web, AI, PR, Logistics).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Live Search & Multi-Facet Filtering</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Instant client-side querying across categories, clubs, and dates with graceful empty states and zero layout shift.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FUTURE ROADMAP (PHASE 2 & BEYOND) */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-bold tracking-tight">
            Phase 2 Expansion Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700">
            <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-blue-400" />
              <span>SSO & Authentication</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Role-based sign-in for students, club reps, and faculty members with granular permission guards.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700">
            <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              <span>Faculty Event Approvals</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Digital document submissions, budget reviews, and formal administrative workflow sign-offs.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700">
            <div className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-purple-400" />
              <span>Digital Passes & QR Scanning</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Instant student registration, dynamic QR passes, live gate attendance tracking, and participation analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 4. DEMO DISCLAIMER */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-xs text-amber-900 space-y-2">
        <div className="font-bold text-amber-950 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-amber-700" />
          <span>Demonstration & Fictional Data Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          The records featured in this application (including student names, contact email handles, and scheduled event times) are illustrative sample data created specifically for architectural prototyping at MIT-ADT University. They do not constitute an official university directory.
        </p>
      </section>

      {/* Back to Explore CTA */}
      <div className="pt-4 flex justify-center">
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <span>Explore College Clubs Directory</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
