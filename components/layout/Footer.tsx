import React from "react";
import Link from "next/link";
import { Compass, Layers, Calendar, Info, Heart, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                C
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Campus<span className="text-blue-600">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect. Collaborate. Create. The centralized student organization and club discovery platform for MIT-ADT University.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
              <Shield className="h-3 w-3 text-blue-600" />
              <span>Phase 1 Prototype Active</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home Landing
                </Link>
              </li>
              <li>
                <Link href="/clubs" className="hover:text-blue-600 transition-colors">
                  Clubs & Chapters
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-blue-600 transition-colors">
                  Campus Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About CampusHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Communities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/organizations/student-council"
                  className="hover:text-blue-600 transition-colors"
                >
                  Student Council
                </Link>
              </li>
              <li>
                <Link
                  href="/organizations/technical-and-innovation-community"
                  className="hover:text-blue-600 transition-colors"
                >
                  Technical & Innovation
                </Link>
              </li>
              <li>
                <Link
                  href="/organizations/cultural-and-creative-community"
                  className="hover:text-blue-600 transition-colors"
                >
                  Cultural & Creative
                </Link>
              </li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Prototype Disclaimer
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This system is an interactive Phase 1 architectural demonstration prepared with sample MIT-ADT University records. Future phases will introduce student authentication, event ticketing, and faculty approvals.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampusHub — MIT-ADT College. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with Next.js & Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
