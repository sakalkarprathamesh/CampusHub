import { notFound } from "next/navigation";
import { isRolePreviewEnabled } from "@/lib/preview/config";
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

  return <RolePreviewCenter />;
}
