"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DatabaseStatus } from "@/lib/data";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Table,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
} from "lucide-react";

interface AdminHealthCheckProps {
  dbStatus: DatabaseStatus;
  showSqlGuide?: boolean;
}

export default function AdminHealthCheck({
  dbStatus,
  showSqlGuide = false,
}: AdminHealthCheckProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [guideOpen, setGuideOpen] = useState(showSqlGuide);

  const totalOk = dbStatus.tableResults?.filter((t) => t.status === "ok").length || 0;
  const totalFallback = dbStatus.tableResults?.filter((t) => t.status === "fallback").length || 0;
  const totalError = dbStatus.tableResults?.filter((t) => t.status === "error").length || 0;
  const totalTables = dbStatus.tableResults?.length || 10;

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const copyMigrationCommand = () => {
    navigator.clipboard.writeText("supabase/migrations/005_production_repair.sql");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tableDescriptions: Record<string, string> = {
    profiles: "User accounts, auth links, campus roles & department info",
    organizations: "Campus bodies (Student Council, Clubs Council, Sports)",
    clubs: "Active student clubs, chapters, and societies",
    club_members: "Official club rosters and member records",
    membership_requests: "Application workflow for students joining clubs",
    club_memberships: "Unified member access view (aliases club_members)",
    events: "Campus workshops, seminars, and club activities",
    event_registrations: "Student RSVPs and event attendance rosters",
    announcements: "Campus-wide and club-specific bulletins",
    notifications: "User alerts for application & approval events",
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  PostgreSQL 10-Table Health Matrix
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    dbStatus.status === "connected"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {dbStatus.status === "connected" ? "Live Connected" : "Resilient Fallback"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Host: <code className="text-slate-700 font-mono">{dbStatus.hostname || "local"}</code> • Verified at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              <span>{isPending ? "Probing..." : "Probe Schema"}</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideOpen(!guideOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>{guideOpen ? "Hide SQL Guide" : "Migration SQL"}</span>
            </button>
          </div>
        </div>

        {/* Summary Counter Bar */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium">Live In Schema Cache</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
              {totalOk} <span className="text-xs font-normal text-emerald-600">/ {totalTables}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="text-xs text-amber-700 font-medium">Resilient Fallback Store</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">
              {totalFallback} <span className="text-xs font-normal text-amber-600">active</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-medium">Total Managed Records</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {Object.values(dbStatus.counts || {}).reduce((a, b) => a + b, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* SQL Migration Helper Banner (if open or if there are fallbacks) */}
      {guideOpen && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <span>Supabase Production Migration Ready (005_production_repair.sql)</span>
            </div>
            <a
              href="https://supabase.com/dashboard/project/pylgszbumdyfyntcguax/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The idempotent migration establishes <code className="text-blue-900 font-mono">public.membership_requests</code> with UUIDs, sets up <code className="text-blue-900 font-mono">public.club_memberships</code> view, triggers, and RLS policies. It also includes <code className="text-blue-900 font-mono">NOTIFY pgrst, &apos;reload schema&apos;;</code> to instantly refresh the PostgREST cache.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 font-mono text-[11px] text-slate-800 select-all truncate">
              supabase/migrations/005_production_repair.sql
            </div>
            <button
              type="button"
              onClick={copyMigrationCommand}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Path"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 10 Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {dbStatus.tableResults?.map((tableCheck) => {
          const isOk = tableCheck.status === "ok";
          const isFallback = tableCheck.status === "fallback";
          const description = tableDescriptions[tableCheck.table] || "Database entity";

          return (
            <div
              key={tableCheck.table}
              className={`p-3.5 rounded-xl border transition ${
                isOk
                  ? "bg-white border-slate-200 hover:border-slate-300"
                  : isFallback
                  ? "bg-amber-50/30 border-amber-200"
                  : "bg-rose-50/30 border-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-slate-900">
                    public.{tableCheck.table}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isOk ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Live OK
                    </span>
                  ) : isFallback ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="h-3 w-3" />
                      Fallback Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="h-3 w-3" />
                      Schema Missing
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                {description}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Current Records:</span>
                <span className="font-semibold text-slate-700">
                  {tableCheck.count !== undefined ? `${tableCheck.count} rows` : "Dual-wire active"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
