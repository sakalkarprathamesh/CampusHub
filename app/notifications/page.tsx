import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NotificationsManager from "@/components/notifications/NotificationsManager";
import { Bell } from "lucide-react";
import { Notification } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?redirectTo=/notifications");
  }

  const supabase = await createSupabaseServerClient();
  let userNotifications: Notification[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      userNotifications = data as Notification[];
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-8 ring-blue-50/50">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding your club memberships, applications, and campus announcements.
          </p>
        </div>
      </div>

      <NotificationsManager initialNotifications={userNotifications} />
    </div>
  );
}
