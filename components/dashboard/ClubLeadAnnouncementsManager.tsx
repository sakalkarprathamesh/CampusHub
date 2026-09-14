"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/lib/auth/actions";
import { Announcement, Club } from "@/types/database";
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Megaphone,
} from "lucide-react";

interface Props {
  initialAnnouncements: Announcement[];
  managedClubs: Club[];
}

export default function ClubLeadAnnouncementsManager({
  initialAnnouncements,
  managedClubs,
}: Props) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formClubId, setFormClubId] = useState(managedClubs[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim() || !formContent.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    startTransition(async () => {
      const res = await createAnnouncementAction(
        formClubId,
        formTitle.trim(),
        formContent.trim(),
        formIsPinned
      );

      if (res.success) {
        setIsModalOpen(false);
        setFormTitle("");
        setFormContent("");
        setFormIsPinned(false);
        setFeedback({
          text: "Announcement broadcasted to all active club members!",
          type: "success",
        });
        router.refresh();
      } else {
        setFormError(res.error || "Failed to broadcast announcement.");
      }
    });
  };

  const handleDeleteAnnouncement = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteAnnouncementAction(id);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setFeedback({
          text: `Announcement "${title}" removed.`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({
          text: res.error || "Failed to delete announcement.",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & New Broadcast Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            <span>Club Broadcasts & Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Send instant updates, meeting notices, and alerts directly to registered members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setFormError(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Announcements Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Keep your club members updated with reminders, event schedules, and critical notices.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post First Broadcast</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                ann.is_pinned ? "border-indigo-200 bg-indigo-50/20" : "border-slate-200/80"
              }`}
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.is_pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    • {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">New Club Announcement</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              {managedClubs.length > 1 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Select Club</label>
                  <select
                    value={formClubId}
                    onChange={(e) => setFormClubId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    {managedClubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., General Body Meeting this Friday at 5 PM"
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Announcement Details</label>
                <textarea
                  required
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Include room location, agenda items, or required preparation..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-600 focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <Pin className="w-3 h-3 text-slate-400" />
                  Pin this announcement to top of feed
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isPending ? "Broadcasting..." : "Broadcast Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
