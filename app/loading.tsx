import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600" />
        </div>
        <p className="text-xs font-medium text-slate-500 animate-pulse">
          Loading CampusHub directory...
        </p>
      </div>
    </div>
  );
}
