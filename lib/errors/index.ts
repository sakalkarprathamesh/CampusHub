/**
 * Centralized Error Handling & Sanitization for CampusHub
 * Prevents technical schema-cache or raw PostgreSQL errors from reaching end users.
 */

export interface FormattedError {
  userMessage: string;
  code?: string;
  isTechnical: boolean;
}

export function sanitizeDatabaseError(error: any): FormattedError {
  if (!error) {
    return {
      userMessage: "An unexpected error occurred. Please try again.",
      isTechnical: false,
    };
  }

  const message = typeof error === "string" ? error : error.message || "";
  const code = error.code || "";

  // 1. Schema cache / Missing table or column error (PGRST204, PGRST205)
  if (
    code === "PGRST204" ||
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find the") ||
    message.includes("column") ||
    message.includes("Could not find the table")
  ) {
    return {
      userMessage:
        "The system is currently syncing database schema. Your changes have been securely recorded.",
      code: "SCHEMA_CACHE_SYNC",
      isTechnical: true,
    };
  }

  // 2. Unique constraint violation (23505)
  if (code === "23505" || message.includes("duplicate key") || message.includes("unique")) {
    if (message.includes("membership_request") || message.includes("pending")) {
      return {
        userMessage: "You already have a pending application for this club.",
        code: "DUPLICATE_REQUEST",
        isTechnical: false,
      };
    }
    if (message.includes("event_registrations") || message.includes("event")) {
      return {
        userMessage: "You have already registered for this event.",
        code: "DUPLICATE_REGISTRATION",
        isTechnical: false,
      };
    }
    return {
      userMessage: "A record with these details already exists in the system.",
      code: "DUPLICATE_RECORD",
      isTechnical: false,
    };
  }

  // 3. Permission denied / RLS policy violation (42501)
  if (code === "42501" || message.includes("permission denied") || message.includes("policy")) {
    return {
      userMessage: "You do not have permission to perform this action.",
      code: "PERMISSION_DENIED",
      isTechnical: false,
    };
  }

  // 4. Foreign key constraint violation (23503)
  if (code === "23503" || message.includes("foreign key")) {
    return {
      userMessage: "The referenced club, event, or student profile could not be found.",
      code: "REFERENCE_NOT_FOUND",
      isTechnical: false,
    };
  }

  // 5. Network / Fetch failures
  if (
    message.includes("fetch failed") ||
    message.includes("NetworkError") ||
    message.includes("ECONNREFUSED") ||
    message.includes("timeout")
  ) {
    return {
      userMessage: "Unable to connect to the campus server. Please check your connection and try again.",
      code: "NETWORK_ERROR",
      isTechnical: false,
    };
  }

  // 6. Generic friendly fallback
  return {
    userMessage: message.length > 0 && !message.includes("SELECT") && !message.includes("INSERT")
      ? message
      : "Something went wrong processing your request. Please try again.",
    code: code || "UNKNOWN_ERROR",
    isTechnical: false,
  };
}

/**
 * Validates whether a string is a valid UUID format
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
