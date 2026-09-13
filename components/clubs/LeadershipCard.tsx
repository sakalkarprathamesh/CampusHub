import React from "react";
import { Mail, GraduationCap, Award, ShieldCheck } from "lucide-react";
import { Profile, MembershipRole } from "@/types/database";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface LeadershipCardProps {
  profile: Profile;
  roleLabel: string;
  isFaculty?: boolean;
}

export function LeadershipCard({
  profile,
  roleLabel,
  isFaculty = false,
}: LeadershipCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge
            variant={isFaculty ? "secondary" : "primary"}
            size="sm"
            className="font-semibold capitalize"
          >
            {isFaculty ? (
              <ShieldCheck className="h-3 w-3 mr-1 text-purple-600" />
            ) : (
              <Award className="h-3 w-3 mr-1 text-blue-600" />
            )}
            {roleLabel}
          </Badge>
          {profile.year_of_study && (
            <span className="text-[11px] font-medium text-slate-500">
              {profile.year_of_study}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5 mb-3">
          <Avatar
            src={profile.avatar_url}
            fallback={profile.full_name}
            size="lg"
            className="shrink-0 rounded-2xl"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
              {profile.full_name}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {profile.department || "Department of Engineering"}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors font-medium truncate max-w-[200px]"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{profile.email}</span>
        </a>
      </div>
    </div>
  );
}
