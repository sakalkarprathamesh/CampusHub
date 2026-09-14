"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/lib/auth/actions";
import { Notification } from "@/types/database";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ArrowRight,
  CalendarCheck,
  CalendarX,
  Megaphone,
  Ticket,
  Inbox,
} from "lucide-react";

interface Props {
  initialNotifications: Notification[];
}

export default function NotificationsManager({ initialNotifications }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsReadAction(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        router.refresh();
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        router.refresh();
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Notifications</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You are completely up to date! When club officers approve applications or post event updates, they will appear here.
        </p>
        <Link
          href="/clubs"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <span>Discover Clubs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "membership_approved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "membership_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "membership_request":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "role_updated":
        return <Shield className="w-5 h-5 text-purple-600" />;
      case "event_registered":
        return <Ticket className="w-5 h-5 text-emerald-600" />;
      case "event_approved":
        return <CalendarCheck className="w-5 h-5 text-blue-600" />;
      case "event_cancelled":
      case "event_rejected":
        return <CalendarX className="w-5 h-5 text-red-500" />;
      case "announcement_posted":
        return <Megaphone className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {unreadCount} unread of {notifications.length} total
          </span>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 rounded-xl transition disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          const formattedDate = new Date(notif.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                notif.is_read
                  ? "bg-white border-slate-200/80 text-slate-700"
                  : "bg-blue-50/40 border-blue-200 shadow-sm text-slate-900"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="text-[11px] text-slate-400 pt-0.5">{formattedDate}</div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="self-end sm:self-center px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition"
                >
                  Mark read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
