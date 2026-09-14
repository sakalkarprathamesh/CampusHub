import { notFound, redirect } from "next/navigation";
import { isRolePreviewEnabled } from "@/lib/preview/config";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import RolePreviewCenter from "@/components/preview/RolePreviewCenter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Role Preview Center | CampusHub",
  description: "Temporary developer preview center for testing all CampusHub role interfaces.",
};

export default async function RolePreviewPage() {
  // 1. Temporary Feature Flag Check
  if (!isRolePreviewEnabled()) {
    notFound();
  }

  // 2. Access Control: developer/admin only
  const { user, profile } = await getCurrentProfile();
  if (user && profile && profile.role !== "admin") {
    redirect("/unauthorized");
  }

  return <RolePreviewCenter />;
}
