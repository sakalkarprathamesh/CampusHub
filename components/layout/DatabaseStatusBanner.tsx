"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Database, Info, X, ExternalLink, AlertTriangle } from "lucide-react";
import type { DatabaseStatus } from "@/lib/data";

interface DatabaseStatusBannerProps {
  status?: DatabaseStatus;
}

export function DatabaseStatusBanner({ status }: DatabaseStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const currentStatus = status?.status || "prototype";
  const currentLabel = status?.label || "Prototype Mode";

  const dotColor = {
    connected: "bg-emerald-500",
    prototype: "bg-blue-500",
    error: "bg-rose-500",
  }[currentStatus];

  const pingColor = {
    connected: "bg-emerald-400",
    prototype: "bg-blue-400",
    error: "bg-rose-400",
  }[currentStatus];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pingColor}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}
            />
          </span>
          <span className="font-bold text-white tracking-wide">
            {currentLabel}
          </span>
          <span className="hidden md:inline text-slate-400">
            {currentStatus === "connected" &&
              "— All directory and organizational queries are dispatched live to your Supabase PostgreSQL cluster."}
            {currentStatus === "prototype" &&
              "— Loaded with 7 MIT-ADT clubs, leadership, teams, and events with relational joins."}
            {currentStatus === "error" &&
              "— Could not query Supabase PostgreSQL. Falling back safely to local demonstration records."}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/supabase-test"
            className="text-blue-400 hover:text-blue-300 underline font-medium text-[11px]"
          >
            Diagnostics
          </Link>
          {currentStatus === "prototype" && (
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Configure <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">.env.local</code> to connect
            </span>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
