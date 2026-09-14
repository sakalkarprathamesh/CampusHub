import { notFound, redirect } from "next/navigation";
import { isRolePreviewEnabled, isValidPreviewRole, PreviewRole, PREVIEW_ROLES } from "@/lib/preview/config";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import RolePreviewContainer from "@/components/preview/RolePreviewContainer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ view?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { role } = await params;
  if (!isValidPreviewRole(role)) {
    return { title: "Role Preview | CampusHub" };
  }
  const meta = PREVIEW_ROLES[role];
  return {
    title: `Preview: ${meta.label} Interface | CampusHub`,
    description: `UI Preview for CampusHub ${meta.label} role.`,
  };
}

export default async function RolePreviewItemPage({ params, searchParams }: PageProps) {
  // 1. Temporary Feature Flag Check
  if (!isRolePreviewEnabled()) {
    notFound();
  }

  // 2. Access Control: developer/admin only
  const { user, profile } = await getCurrentProfile();
  if (user && profile && profile.role !== "admin") {
    redirect("/unauthorized");
  }

  const { role } = await params;
  if (!isValidPreviewRole(role)) {
    notFound();
  }

  const { view } = await searchParams;
  const initialView =
    view === "login" || view === "register" || view === "profile" ? view : "dashboard";

  return <RolePreviewContainer initialRole={role} initialView={initialView} />;
}
