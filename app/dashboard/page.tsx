import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getDashboardPathForRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const destination = getDashboardPathForRole(profile?.role);
  redirect(destination);
}
