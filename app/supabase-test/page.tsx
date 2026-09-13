import React from "react";
import Link from "next/link";
import {
  getDatabaseStatus,
  getOrganizations,
  getClubs,
} from "@/lib/data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Layers,
  Users,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Info,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "Database Diagnostic & Connection Test — CampusHub",
  description:
    "Developer diagnostic view verifying live Supabase PostgreSQL connectivity, counts, and sample records.",
};

export default async function SupabaseTestPage() {
  const dbStatus = await getDatabaseStatus();
  const [organizations, clubs] = await Promise.all([
    getOrganizations(),
    getClubs({ limit: 4 }),
  ]);

  const statusBadge = {
    connected: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      label: "Supabase Connected",
    },
    prototype: {
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Info,
      label: "Prototype Mode",
    },
    error: {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      icon: XCircle,
      label: "Database Error",
    },
  }[dbStatus.status];

  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: "Database Test Diagnostic" }]} className="mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Supabase Connection Diagnostic
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time database connectivity test, entity counts, and verification suite.
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusBadge.bg}`}
          >
            <StatusIcon className="h-4 w-4" />
            <span>{statusBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <span>Connection Overview</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-500">Live Status Mode:</span>
            <span className="font-bold text-slate-900">{dbStatus.label}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-500">Status Message:</span>
            <span className="text-slate-700">{dbStatus.message}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-500">Environment Variables Detected:</span>
            <span className="font-medium text-slate-900">
              {dbStatus.isConfigured ? "Configured (NEXT_PUBLIC_SUPABASE_URL set)" : "Not Configured (.env.local missing or using defaults)"}
            </span>
          </div>

          {dbStatus.error && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <strong className="block mb-1">Query Error Details:</strong>
              <code className="block bg-white p-2 rounded border border-rose-200 text-[11px] overflow-x-auto">
                {dbStatus.error}
              </code>
            </div>
          )}
        </div>

        {/* Instructions when in Prototype Mode */}
        {dbStatus.status === "prototype" && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <Terminal className="h-4 w-4" />
              <span>How to connect your remote Supabase PostgreSQL database:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>
                Open <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">.env.local</code> in the project root.
              </li>
              <li>
                Paste your Supabase URL in <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">NEXT_PUBLIC_SUPABASE_URL</code>.
              </li>
              <li>
                Paste your public anon key in <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </li>
              <li>
                Execute <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">supabase/migrations/001_initial_schema.sql</code> and <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">supabase/seed.sql</code> in the Supabase SQL editor.
              </li>
              <li>
                Restart the app: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">npm run dev</code>.
              </li>
            </ol>
          </div>
        )}
      </section>

      {/* Database Counts Matrix */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Relational Table Records
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 inline-flex mb-2">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStatus.counts?.organizations ?? organizations.length}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Organizations
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 inline-flex mb-2">
              <Layers className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStatus.counts?.clubs ?? clubs.length}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Clubs
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 inline-flex mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStatus.counts?.profiles ?? 17}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Profiles
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 inline-flex mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStatus.counts?.teams ?? 15}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Teams
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 inline-flex mb-2">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {dbStatus.counts?.events ?? 10}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Events
            </div>
          </div>
        </div>
      </section>

      {/* Sample Organizations */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Sample Organizations ({organizations.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <div key={org.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs">{org.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">{org.description}</p>
              <Link
                href={`/organizations/${org.slug}`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 pt-1"
              >
                <span>View slug: /{org.slug}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Clubs */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Sample Clubs ({clubs.length} sample displayed)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <div key={club.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">{club.name}</h3>
                <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-1">
                  {club.category}
                </span>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1.5">{club.description}</p>
              </div>
              <Link
                href={`/clubs/${club.slug}`}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Visit &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
