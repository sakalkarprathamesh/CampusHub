import React from "react";
import Link from "next/link";
import { ArrowRight, Users, UsersRound, Calendar, Building2 } from "lucide-react";
import { Club } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { getCategoryBadgeColor } from "@/lib/utils";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  const badgeColors = getCategoryBadgeColor(club.category);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200">
      <div>
        {/* Top bar: Category Badge + Organization */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColors.bg} ${badgeColors.border}`}
          >
            {club.category}
          </span>
          {club.organization && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 truncate max-w-[140px]">
              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{club.organization.name}</span>
            </span>
          )}
        </div>

        {/* Club Logo & Name */}
        <div className="flex items-start gap-4 mb-3">
          <Avatar
            src={club.logo_url}
            fallback={club.name}
            size="lg"
            className="rounded-2xl shrink-0 border border-slate-100 shadow-sm"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {club.name}
            </h3>
            {club.president ? (
              <p className="text-xs text-slate-500 mt-0.5">
                Lead: <span className="font-medium text-slate-700">{club.president.full_name}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Active Student Chapter</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {club.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <UsersRound className="h-3.5 w-3.5 text-slate-400" />
            <span>{club.teams?.length || club.team_count || 2} Teams</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{club.events?.length || club.event_count || 1} Events</span>
          </span>
        </div>

        <Link
          href={`/clubs/${club.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>View Club</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
