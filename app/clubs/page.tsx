import React from "react";
import { getClubs, getOrganizations, getCategories } from "@/lib/data";
import { ClubDirectoryClient } from "@/components/clubs/ClubDirectoryClient";
import { Layers } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Clubs Directory — CampusHub",
  description:
    "Explore all student clubs, technical societies, and cultural collectives at MIT-ADT University.",
};

export default async function ClubsPage() {
  const [clubs, organizations, categories] = await Promise.all([
    getClubs(),
    getOrganizations(),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumbs items={[{ label: "Clubs Directory" }]} className="mb-4" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Clubs & Chapters
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse {clubs.length} registered organizations across technology, design, entrepreneurship, and arts.
            </p>
          </div>
        </div>
      </div>

      {/* Directory with live filtering */}
      <ClubDirectoryClient
        initialClubs={clubs}
        organizations={organizations}
        categories={categories}
      />
    </div>
  );
}
