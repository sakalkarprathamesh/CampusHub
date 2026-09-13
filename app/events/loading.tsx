import React from "react";

export default function EventsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-200 rounded" />
      </div>

      <div className="h-10 w-72 bg-slate-200 rounded-xl" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
