"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error if needed
    console.error("CampusHub Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-rose-100 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            System Notification
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred while processing this request. You can try refreshing the data or returning to the directory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
