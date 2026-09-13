"use client";

import React, { useState, useMemo } from "react";
import { Event, Club } from "@/types/database";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EventDirectoryClientProps {
  initialUpcomingEvents: Event[];
  initialPastEvents: Event[];
  clubs: Club[];
}

export function EventDirectoryClient({
  initialUpcomingEvents,
  initialPastEvents,
  clubs,
}: EventDirectoryClientProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState("all");

  const currentDataset = activeTab === "upcoming" ? initialUpcomingEvents : initialPastEvents;

  const filteredEvents = useMemo(() => {
    return currentDataset.filter((event) => {
      // Club filter
      if (selectedClub !== "all" && event.club?.slug !== selectedClub) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== "") {
        const term = searchQuery.toLowerCase().trim();
        const matchesTitle = event.title.toLowerCase().includes(term);
        const matchesDesc = event.description.toLowerCase().includes(term);
        const matchesVenue = event.venue.toLowerCase().includes(term);
        const matchesClub = event.club?.name.toLowerCase().includes(term) || false;
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesClub) {
          return false;
        }
      }
      return true;
    });
  }, [currentDataset, searchQuery, selectedClub]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedClub("all");
  };

  return (
    <div>
      <EventFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedClub={selectedClub}
        onClubChange={setSelectedClub}
        clubs={clubs}
        totalResults={filteredEvents.length}
      />

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <CalendarX className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No {activeTab} events match your filters
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            We couldn&apos;t find any events matching your selected club or keyword query. Try resetting your filters.
          </p>
          <div className="mt-5">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Reset search & filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
