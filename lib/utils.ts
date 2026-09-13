import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getCategoryBadgeColor(category: string): {
  bg: string;
  text: string;
  border: string;
} {
  const normalized = category.toLowerCase();
  if (normalized.includes("tech") || normalized.includes("coding")) {
    return {
      bg: "bg-blue-50 text-blue-700",
      text: "text-blue-700",
      border: "border-blue-200",
    };
  }
  if (normalized.includes("robotics") || normalized.includes("engineering")) {
    return {
      bg: "bg-cyan-50 text-cyan-700",
      text: "text-cyan-700",
      border: "border-cyan-200",
    };
  }
  if (normalized.includes("design") || normalized.includes("creative")) {
    return {
      bg: "bg-purple-50 text-purple-700",
      text: "text-purple-700",
      border: "border-purple-200",
    };
  }
  if (normalized.includes("entrepreneurship") || normalized.includes("business")) {
    return {
      bg: "bg-amber-50 text-amber-700",
      text: "text-amber-700",
      border: "border-amber-200",
    };
  }
  if (normalized.includes("arts") || normalized.includes("cultural")) {
    return {
      bg: "bg-rose-50 text-rose-700",
      text: "text-rose-700",
      border: "border-rose-200",
    };
  }
  if (normalized.includes("photography") || normalized.includes("media")) {
    return {
      bg: "bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      border: "border-emerald-200",
    };
  }
  return {
    bg: "bg-slate-100 text-slate-700",
    text: "text-slate-700",
    border: "border-slate-200",
  };
}
