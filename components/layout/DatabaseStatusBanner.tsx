"use client";

import React, { useState } from "react";
import { Database, Info, X, ExternalLink } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function DatabaseStatusBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSupabaseConfigured ? "bg-emerald-400" : "bg-blue-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSupabaseConfigured ? "bg-emerald-500" : "bg-blue-500"
              }`}
            />
          </span>
          <span className="font-medium text-white">
            {isSupabaseConfigured ? "Live PostgreSQL Database Connected" : "Running Prototype Mode (Local Seed Data)"}
          </span>
          <span className="hidden md:inline text-slate-400">
            {isSupabaseConfigured
              ? "All queries are being dispatched directly to your Supabase PostgreSQL cluster."
              : "All 7 clubs, organizations, leadership, teams, and events are loaded with instant relational joins."}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isSupabaseConfigured && (
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              To connect Supabase, configure <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">.env.local</code>
            </span>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
