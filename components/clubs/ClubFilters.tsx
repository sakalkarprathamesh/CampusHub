"use client";

import React from "react";
import { Search, Filter, X, Building2, Tag } from "lucide-react";
import { Organization } from "@/types/database";

interface ClubFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedOrg: string;
  onOrgChange: (org: string) => void;
  categories: string[];
  organizations: Organization[];
  totalResults: number;
}

export function ClubFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedOrg,
  onOrgChange,
  categories,
  organizations,
  totalResults,
}: ClubFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategory !== "all" || selectedOrg !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onOrgChange("all");
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search and Dropdowns Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clubs by name, category, or keywords..."
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

        {/* Category Select */}
        <div className="md:col-span-3 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Organization Select */}
        <div className="md:col-span-3 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={selectedOrg}
            onChange={(e) => onOrgChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm cursor-pointer"
          >
            <option value="all">All Communities</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.slug}>
                {org.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Filter status & quick pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <span>Showing <strong className="text-slate-900">{totalResults}</strong> {totalResults === 1 ? "club" : "clubs"}</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
