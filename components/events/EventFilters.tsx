"use client";

import React from "react";
import { Search, Filter, CalendarCheck, CalendarDays, X } from "lucide-react";
import { Club } from "@/types/database";

interface EventFiltersProps {
  activeTab: "upcoming" | "past";
  onTabChange: (tab: "upcoming" | "past") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClub: string;
  onClubChange: (clubSlug: string) => void;
  clubs: Club[];
  totalResults: number;
}

export function EventFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedClub,
  onClubChange,
  clubs,
  totalResults,
}: EventFiltersProps) {
  const hasActiveFilters = searchQuery.trim() !== "" || selectedClub !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onClubChange("all");
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Tab switchers: Upcoming vs Past */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => onTabChange("upcoming")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Upcoming Events</span>
          </button>
          <button
            onClick={() => onTabChange("past")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "past"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Past Events Archive</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{totalResults}</strong> {activeTab} {totalResults === 1 ? "event" : "events"}
        </div>
      </div>

      {/* Search and Club selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events by title, venue, keywords, or topics..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="md:col-span-4 relative">
          <select
            value={selectedClub}
            onChange={(e) => onClubChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer"
          >
            <option value="all">All Organizing Clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Clear search & filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
