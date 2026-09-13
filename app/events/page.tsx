import React from "react";
import { getUpcomingEvents, getPastEvents, getClubs } from "@/lib/data";
import { EventDirectoryClient } from "@/components/events/EventDirectoryClient";
import { Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Events Directory — CampusHub",
  description:
    "Explore upcoming hackathons, workshops, cultural festivals, and seminars across MIT-ADT University clubs.",
};

export default async function EventsPage() {
  const [upcomingEvents, pastEvents, clubs] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
    getClubs(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Breadcrumbs */}
      <div>
        <Breadcrumbs items={[{ label: "Events Directory" }]} className="mb-4" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Events & Symposia
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover official student chapter events, hackathons, robotics challenges, and music festivals.
            </p>
          </div>
        </div>
      </div>

      {/* Directory with tabs and live filtering */}
      <EventDirectoryClient
        initialUpcomingEvents={upcomingEvents}
        initialPastEvents={pastEvents}
        clubs={clubs}
      />
    </div>
  );
}
