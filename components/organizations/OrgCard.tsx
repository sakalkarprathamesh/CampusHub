import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Layers, ChevronRight } from "lucide-react";
import { Organization } from "@/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface OrgCardProps {
  organization: Organization;
}

export function OrgCard({ organization }: OrgCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Avatar
            src={organization.logo_url}
            fallback={organization.name}
            size="lg"
            className="rounded-2xl shrink-0"
          />
          <Badge variant="primary" size="sm">
            {organization.club_count || organization.clubs?.length || 0} Affiliated Clubs
          </Badge>
        </div>

        {/* Name and Description */}
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {organization.name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-5">
          {organization.description}
        </p>

        {/* Preview of child clubs */}
        {organization.clubs && organization.clubs.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Constituent Clubs
            </span>
            <div className="flex flex-wrap gap-1.5">
              {organization.clubs.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  <span>{club.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA link */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">MIT-ADT Governing Community</span>
        <Link
          href={`/organizations/${organization.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <span>Explore Community</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
