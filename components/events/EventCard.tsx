import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Event } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200">
      {/* Banner Image */}
      {event.banner_url && (
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.banner_url}
            alt={event.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3">
            {event.status === "cancelled" ? (
              <Badge variant="destructive" size="sm" className="bg-rose-600 text-white border-transparent backdrop-blur-md">
                Cancelled
              </Badge>
            ) : isPast ? (
              <Badge variant="default" size="sm" className="bg-slate-900/80 text-white border-transparent backdrop-blur-md">
                Completed Event
              </Badge>
            ) : (
              <Badge variant="primary" size="sm" className="bg-blue-600 text-white border-transparent backdrop-blur-md shadow-sm">
                Upcoming
              </Badge>
            )}
          </div>

          {event.club && (
            <div className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow-sm flex items-center gap-1.5">
              <span>{event.club.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-700">
              {formatDate(event.event_date)}
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {formatTime(event.event_date)}
            </span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Users className="h-3 w-3" />
              <span>Cap: {event.capacity} seats</span>
            </span>

            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
