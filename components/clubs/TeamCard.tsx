"use client";

import React, { useState } from "react";
import { UsersRound, ChevronDown, ChevronUp, UserCheck, Star } from "lucide-react";
import { TeamWithMembers } from "@/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface TeamCardProps {
  team: TeamWithMembers;
}

export function TeamCard({ team }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-900">{team.name}</h4>
            <Badge variant="outline" size="sm">
              {team.members.length} {team.members.length === 1 ? "Member" : "Members"}
            </Badge>
          </div>
          {team.description && (
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {team.description}
            </p>
          )}
        </div>
      </div>

      {/* Team Lead Highlight */}
      {team.lead && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar
              src={team.lead.avatar_url}
              fallback={team.lead.full_name}
              size="sm"
              className="shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {team.lead.full_name}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                  <Star className="h-2.5 w-2.5 fill-amber-600 text-amber-600" />
                  Team Lead
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {team.lead.department} • {team.lead.year_of_study}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable member roster */}
      {team.members.length > 1 && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <span>{expanded ? "Hide Team Members" : `View All Members (${team.members.length})`}</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <Avatar
                    src={member.profile.avatar_url}
                    fallback={member.profile.full_name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {member.profile.full_name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {member.is_lead ? "Team Lead" : "Core Member"} • {member.profile.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
