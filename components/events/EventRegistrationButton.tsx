"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { registerForEventAction, cancelEventRegistrationAction } from "@/lib/auth/actions";
import {
  Ticket,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarX,
  Users,
  Clock,
  Sparkles,
  QrCode,
  X,
} from "lucide-react";

interface Props {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  capacity: number;
  initialRegisteredCount: number;
  isLoggedIn: boolean;
  isPast: boolean;
  isCancelled: boolean;
  initialIsRegistered: boolean;
}

export default function EventRegistrationButton({
  eventId,
  eventSlug,
  eventTitle,
  capacity,
  initialRegisteredCount,
  isLoggedIn,
  isPast,
  isCancelled,
  initialIsRegistered,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [registeredCount, setRegisteredCount] = useState(initialRegisteredCount);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 1. Not logged in
  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <Link
          href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Ticket className="w-4 h-4" />
          <span>Sign In to Claim Student Pass</span>
        </Link>
        <p className="text-[11px] text-slate-500 text-center">
          Open to all currently enrolled MIT-ADT students.
        </p>
      </div>
    );
  }

  // 2. Event is Cancelled
  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-left">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
          <CalendarX className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Event Cancelled</span>
        </div>
        <p className="text-[11px] text-rose-700 leading-relaxed">
          The organizers have cancelled this event. Registrations are closed.
        </p>
      </div>
    );
  }

  // 3. Event is Past / Concluded
  if (isPast) {
    return (
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5 text-left">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Event Concluded</span>
        </div>
        <p className="text-[11px] text-slate-500">
          This campus event has ended. Check back for future workshops and hackathons.
        </p>
      </div>
    );
  }

  const isFull = registeredCount >= capacity;
  const spotsLeft = Math.max(0, capacity - registeredCount);

  // 4. Handle Registration
  const handleRegister = () => {
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await registerForEventAction(eventId);
      if (res.success) {
        setIsRegistered(true);
        setRegisteredCount((c) => c + 1);
        setSuccessMsg("Registration successful! Your digital pass is ready.");
        router.refresh();
      } else {
        setError(res.error || "Failed to register for this event.");
      }
    });
  };

  // 5. Handle Cancel Registration
  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel your event registration?")) {
      return;
    }

    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await cancelEventRegistrationAction(eventId);
      if (res.success) {
        setIsRegistered(false);
        setRegisteredCount((c) => Math.max(0, c - 1));
        setSuccessMsg("Your registration has been cancelled.");
        router.refresh();
      } else {
        setError(res.error || "Failed to cancel registration.");
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Capacity tracker */}
      <div className="flex items-center justify-between text-xs pb-1">
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Attendance Roster</span>
        </span>
        <span className="font-semibold text-slate-900">
          {registeredCount} / {capacity} spots ({spotsLeft} left)
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFull ? "bg-amber-500" : "bg-blue-600"
          }`}
          style={{ width: `${Math.min(100, (registeredCount / capacity) * 100)}%` }}
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* State: Registered */}
      {isRegistered ? (
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>You Are Registered</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Your admission ticket is confirmed. Present your student ID or digital pass at the entrance.
            </p>
            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline pt-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>View Digital QR Pass</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="w-full py-2 px-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/60 border border-red-200/80 rounded-xl transition disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Cancel My Registration"}
          </button>
        </div>
      ) : isFull ? (
        <div className="space-y-2 pt-1">
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <XCircle className="h-4 w-4" />
            <span>Registration Full (Waitlist Only)</span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            All {capacity} student seats are occupied.
          </p>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={handleRegister}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
          >
            <Ticket className="w-4 h-4" />
            <span>{isPending ? "Confirming Pass..." : "Register for Event (Free)"}</span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Instant digital confirmation and attendance check-in.
          </p>
        </div>
      )}

      {/* Digital QR Pass Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 text-center relative">
            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Digital Event Pass
              </span>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1">{eventTitle}</h3>
              <p className="text-xs text-slate-500">MIT-ADT University Campus Entry</p>
            </div>

            {/* QR Mock graphic */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 inline-block mx-auto shadow-inner">
              <div className="w-36 h-36 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white space-y-1">
                <QrCode className="w-20 h-20 text-blue-400" />
                <span className="text-[9px] font-mono tracking-widest text-slate-300">PASS-VERIFIED</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-800">Status: Registered Attendee</p>
              <p className="text-[11px]">Show this barcode at the venue entrance scanner.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
