import { UserRole } from "@/types/database";

export interface RoleConfig {
  label: string;
  badgeClass: string;
  description: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    label: "Administrator",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60",
    description: "Full platform oversight, club governance, and user role management.",
  },
  faculty_coordinator: {
    label: "Faculty Advisor",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60",
    description: "Academic oversight, event review, and official department liaison.",
  },
  club_lead: {
    label: "Club Leader",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60",
    description: "President or executive managing membership, teams, and activities.",
  },
  club_member: {
    label: "Club Member",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60",
    description: "Active participating member of campus student organizations.",
  },
  student: {
    label: "Student",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60",
    description: "Campus community member discovering clubs and public events.",
  },
};

export function getRoleLabel(role?: UserRole | null): string {
  if (!role || !ROLE_CONFIGS[role]) return "Student";
  return ROLE_CONFIGS[role].label;
}

export function getRoleBadgeClass(role?: UserRole | null): string {
  if (!role || !ROLE_CONFIGS[role]) return ROLE_CONFIGS.student.badgeClass;
  return ROLE_CONFIGS[role].badgeClass;
}

export function isAdmin(role?: UserRole | null): boolean {
  return role === "admin";
}

export function isFaculty(role?: UserRole | null): boolean {
  return role === "faculty_coordinator" || role === "admin";
}

export function isClubLead(role?: UserRole | null): boolean {
  return role === "club_lead" || role === "admin";
}

export function getDashboardPathForRole(role?: UserRole | null): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "faculty_coordinator":
      return "/dashboard/faculty";
    case "club_lead":
      return "/dashboard/club";
    case "club_member":
    case "student":
    default:
      return "/dashboard/student";
  }
}
