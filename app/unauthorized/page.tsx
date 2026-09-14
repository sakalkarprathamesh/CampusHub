import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Access Restricted
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            You do not have the required administrative or leadership permissions to view this dashboard.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
          <div className="font-semibold text-slate-700">Need elevated access?</div>
          <p>
            If you are a club president, student organization lead, or faculty advisor, your role must be granted by campus administrators in accordance with college policy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
