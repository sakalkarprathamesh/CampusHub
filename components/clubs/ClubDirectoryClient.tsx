"use client";

import React, { useState, useMemo } from "react";
import { Club, Organization } from "@/types/database";
import { ClubCard } from "@/components/clubs/ClubCard";
import { ClubFilters } from "@/components/clubs/ClubFilters";
import { Layers, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ClubDirectoryClientProps {
  initialClubs: Club[];
  organizations: Organization[];
  categories: string[];
}

export function ClubDirectoryClient({
  initialClubs,
  organizations,
  categories,
}: ClubDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState("all");

  const filteredClubs = useMemo(() => {
    return initialClubs.filter((club) => {
      // Category filter
      if (selectedCategory !== "all" && club.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Organization filter
      if (selectedOrg !== "all" && club.organization?.slug !== selectedOrg) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const term = searchQuery.toLowerCase().trim();
        const matchesName = club.name.toLowerCase().includes(term);
        const matchesDesc = club.description.toLowerCase().includes(term);
        const matchesCat = club.category.toLowerCase().includes(term);
        const matchesOrg = club.organization?.name.toLowerCase().includes(term) || false;
        if (!matchesName && !matchesDesc && !matchesCat && !matchesOrg) {
          return false;
        }
      }
      return true;
    });
  }, [initialClubs, searchQuery, selectedCategory, selectedOrg]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedOrg("all");
  };

  return (
    <div>
      <ClubFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedOrg={selectedOrg}
        onOrgChange={setSelectedOrg}
        categories={categories}
        organizations={organizations}
        totalResults={filteredClubs.length}
      />

      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No clubs match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            We couldn&apos;t find any clubs matching your current search and filter settings. Try adjusting your query or resetting filters.
          </p>
          <div className="mt-5">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Reset all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
