export type PreviewRole = "student" | "club_lead" | "faculty" | "admin";

export interface PreviewRoleMeta {
  key: PreviewRole;
  label: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
  defaultEmail: string;
  defaultName: string;
  defaultDepartment: string;
}

export const PREVIEW_ROLES: Record<PreviewRole, PreviewRoleMeta> = {
  student: {
    key: "student",
    label: "Student",
    badgeLabel: "Student",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400",
    description: "Discover clubs, submit join requests, browse events, and track active memberships.",
    defaultEmail: "alex.rivera@gmail.com",
    defaultName: "Alex Rivera",
    defaultDepartment: "Computer Science",
  },
  club_lead: {
    key: "club_lead",
    label: "Club Lead",
    badgeLabel: "Club President",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
    description: "Manage membership applications, supervise executive sub-teams, and coordinate club activities.",
    defaultEmail: "marcus.brody@campushub.edu",
    defaultName: "Marcus Brody",
    defaultDepartment: "School of Computing",
  },
  faculty: {
    key: "faculty",
    label: "Faculty",
    badgeLabel: "Faculty Advisor",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400",
    description: "Oversee academic compliance, review club events, and manage official faculty charters.",
    defaultEmail: "faculty@campushub.edu",
    defaultName: "Dr. Elena Vance",
    defaultDepartment: "School of Engineering",
  },
  admin: {
    key: "admin",
    label: "Admin",
    badgeLabel: "Administrator",
    badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400",
    description: "Full platform governance, user role assignments, audit logs, and platform analytics.",
    defaultEmail: "admin@campushub.edu",
    defaultName: "Campus Admin",
    defaultDepartment: "Dean of Student Affairs",
  },
};

export function isRolePreviewEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ROLE_PREVIEW === "true";
}

export function isValidPreviewRole(role: string): role is PreviewRole {
  return role === "student" || role === "club_lead" || role === "faculty" || role === "admin";
}
