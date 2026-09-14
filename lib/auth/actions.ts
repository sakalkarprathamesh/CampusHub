"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDashboardPathForRole } from "./roles";
import {
  logSystemActivity,
  MEM_EVENT_REGISTRATIONS,
  MEM_ANNOUNCEMENTS,
  MEM_MEMBERSHIP_REQUESTS,
  getEventAttendees,
} from "@/lib/data";
import { sanitizeDatabaseError } from "@/lib/errors";
import { UserRole } from "@/types/database";
import { SEED_EVENTS } from "@/lib/data/seed-data";

export interface FormState {
  error?: string | null;
  success?: string | null;
}

export async function signInAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!password) {
    return { error: "Please enter your password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Unable to connect. Please try again." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("invalid login credentials") ||
      msg.includes("invalid credentials") ||
      msg.includes("user not found") ||
      msg.includes("wrong password")
    ) {
      return { error: "Incorrect email or password." };
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("connect")) {
      return { error: "Unable to connect. Please try again." };
    }
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Unable to connect. Please try again." };
  }

  // Determine redirection target (default to /dashboard/student)
  let targetPath = "/dashboard/student";
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    targetPath = redirectTo;
  }

  revalidatePath("/", "layout");
  redirect(targetPath);
}

export async function signUpAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("fullName")?.toString().trim();

  if (!fullName) {
    return { error: "Please enter your full name." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const rawRole = formData.get("role")?.toString().trim() || "student";
  let role: UserRole = "student";
  if (rawRole === "faculty" || rawRole === "faculty_coordinator") {
    role = "faculty_coordinator";
  } else if (rawRole === "club_lead") {
    role = "club_lead";
  } else if (rawRole === "admin") {
    role = "admin";
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Unable to connect. Please try again." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { error: "An account with this email already exists. Please log in instead." };
    }
    return { error: error.message };
  }

  // Detect if user already registered when identities array is empty
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: "An account with this email already exists. Please log in instead." };
  }

  // Ensure profile row exists with selected role
  if (data?.user) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" }
      );
    } catch {
      // safe fallback if trigger handled it
    }
  }

  // If email confirmation is enabled, user session won't be active immediately
  if (!data?.session) {
    return {
      success:
        "Your account was created. Please check your email and click the confirmation link before logging in.",
    };
  }

  revalidatePath("/", "layout");
  redirect(getDashboardPathForRole(role));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfileAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database connection failed." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const fullName = formData.get("fullName")?.toString().trim();
  const department = formData.get("department")?.toString().trim() || null;
  const yearOfStudy = formData.get("yearOfStudy")?.toString().trim() || null;
  const phone = formData.get("phone")?.toString().trim() || null;
  const bio = formData.get("bio")?.toString().trim() || null;
  const skillsRaw = formData.get("skills")?.toString().trim() || "";
  const interestsRaw = formData.get("interests")?.toString().trim() || "";

  if (!fullName) {
    return { error: "Full name is required." };
  }

  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const interests = interestsRaw
    ? interestsRaw.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      department,
      year_of_study: yearOfStudy,
      phone,
      bio,
      skills,
      interests,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    const isColumnOrSchema =
      error.code === "PGRST204" ||
      error.code === "PGRST205" ||
      error.message?.includes("column") ||
      error.message?.includes("schema cache") ||
      error.message?.includes("Could not find the");

    if (isColumnOrSchema) {
      const { error: coreError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          department,
          year_of_study: yearOfStudy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (coreError) {
        return { error: sanitizeDatabaseError(coreError).userMessage };
      }

      revalidatePath("/profile");
      revalidatePath("/dashboard", "layout");
      return { success: "Profile successfully updated!" };
    }

    return { error: sanitizeDatabaseError(error).userMessage };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard", "layout");
  return { success: "Profile successfully updated!" };
}

export async function requestMembershipAction(
  clubId: string,
  message?: string
): Promise<{ success?: boolean; error?: string; message?: string }> {
  if (!clubId || typeof clubId !== "string") {
    return { error: "Please select a valid club to join." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Unable to connect to the campus server. Please try again." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in before joining a club." };
  }

  // 1. Verify user profile exists
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return { error: "Your student profile is not set up yet. Please complete registration first." };
    }
  } catch {}

  // 2. Check if already active member in club_members
  try {
    const { data: existingMember } = await supabase
      .from("club_members")
      .select("id, status")
      .eq("club_id", clubId)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (existingMember && existingMember.status === "active") {
      return { error: "You are already an active member of this club." };
    }
  } catch {}

  // 3. Check if already pending request in Supabase
  try {
    const { data: pendingReq } = await supabase
      .from("membership_requests")
      .select("id, status")
      .eq("club_id", clubId)
      .or(`user_id.eq.${user.id},student_id.eq.${user.id}`)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingReq) {
      return { error: "Your application is already pending." };
    }
  } catch {}

  // Also check in-memory store for pending request
  const memPending = MEM_MEMBERSHIP_REQUESTS.find(
    (r) =>
      r.club_id === clubId &&
      (r.user_id === user.id || r.student_id === user.id) &&
      r.status === "pending"
  );
  if (memPending) {
    return { error: "Your application is already pending." };
  }

  // 4. Clean message input with length limit
  const sanitizedMessage = message?.trim() ? message.trim().slice(0, 1000) : null;
  const requestId = crypto.randomUUID();
  const now = new Date().toISOString();

  // 5. Try Supabase insertion first
  let supabaseSucceeded = false;
  try {
    const { error: insertError } = await supabase
      .from("membership_requests")
      .insert({
        id: requestId,
        club_id: clubId,
        student_id: user.id,
        user_id: user.id,
        message: sanitizedMessage,
        status: "pending",
      });

    if (!insertError) {
      supabaseSucceeded = true;
    } else {
      console.warn("[CampusHub] Supabase membership_requests insert fallback:", insertError.message);
    }
  } catch (err: any) {
    console.warn("[CampusHub] Supabase membership_requests insert exception:", err?.message);
  }

  // 6. Dual-wire fallback: always store in MEM_MEMBERSHIP_REQUESTS if Supabase table is not yet in schema cache
  if (!supabaseSucceeded) {
    MEM_MEMBERSHIP_REQUESTS.unshift({
      id: requestId,
      club_id: clubId,
      student_id: user.id,
      user_id: user.id,
      message: sanitizedMessage,
      status: "pending",
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: now,
      updated_at: now,
    });
  }

  // 7. Dispatch notification to club leadership (non-blocking)
  try {
    const { data: club } = await supabase
      .from("clubs")
      .select("name, faculty_coordinator_id")
      .eq("id", clubId)
      .maybeSingle();

    const clubName = club?.name || "your club";

    const { data: leads } = await supabase
      .from("club_members")
      .select("profile_id")
      .eq("club_id", clubId)
      .in("role", ["president", "vice_president", "lead"]);

    const leadIds = new Set<string>();
    if (leads) {
      leads.forEach((l) => leadIds.add(l.profile_id));
    }
    if (club?.faculty_coordinator_id) {
      leadIds.add(club.faculty_coordinator_id);
    }

    if (leadIds.size > 0) {
      const notifs = Array.from(leadIds).map((pId) => ({
        id: crypto.randomUUID(),
        profile_id: pId,
        title: "New Membership Application",
        message: `A student has submitted an application to join ${clubName}.`,
        type: "membership_request",
        is_read: false,
      }));
      await supabase.from("notifications").insert(notifs);
    }
  } catch {}

  // 8. Log activity
  await logSystemActivity({
    userId: user.id,
    action: "membership_requested",
    targetType: "club",
    targetId: clubId,
    details: { requestId },
  });

  revalidatePath(`/clubs`);
  revalidatePath(`/dashboard/student`);
  revalidatePath(`/dashboard/club`);
  return {
    success: true,
    message: "Your membership application has been submitted to club officers!",
  };
}

export async function cancelMembershipRequestAction(
  requestId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!requestId) return { error: "Request ID is required." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database connection failed." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to cancel your application." };
  }

  // Update in Supabase
  try {
    await supabase
      .from("membership_requests")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);
  } catch {}

  // Update in MEM_MEMBERSHIP_REQUESTS
  const memReq = MEM_MEMBERSHIP_REQUESTS.find((r) => r.id === requestId);
  if (memReq) {
    memReq.status = "cancelled";
    memReq.updated_at = new Date().toISOString();
  }

  revalidatePath(`/clubs`);
  revalidatePath(`/dashboard/student`);
  revalidatePath(`/dashboard/club`);
  return { success: true };
}

export async function reviewMembershipRequestAction({
  requestId,
  action,
  rejectionReason,
}: {
  requestId: string;
  action: "approved" | "rejected";
  rejectionReason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  if (!requestId) return { error: "Request ID is required." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database connection failed." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to review requests." };
  }

  // 1. Fetch request details from Supabase or MEM_MEMBERSHIP_REQUESTS
  let request: any = null;
  try {
    const { data: dbReq } = await supabase
      .from("membership_requests")
      .select("*, club:clubs(id, name)")
      .eq("id", requestId)
      .maybeSingle();

    if (dbReq) request = dbReq;
  } catch {}

  const memIndex = MEM_MEMBERSHIP_REQUESTS.findIndex((r) => r.id === requestId);
  if (!request && memIndex !== -1) {
    request = MEM_MEMBERSHIP_REQUESTS[memIndex];
  }

  if (!request) {
    return { error: "Membership application record could not be found." };
  }

  const now = new Date().toISOString();
  const applicantId = request.student_id || request.user_id;

  // 2. Update status in Supabase
  try {
    await supabase
      .from("membership_requests")
      .update({
        status: action,
        rejection_reason: action === "rejected" ? rejectionReason?.trim() || null : null,
        reviewed_by: user.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", requestId);
  } catch {}

  // 3. Update in MEM_MEMBERSHIP_REQUESTS
  if (memIndex !== -1) {
    MEM_MEMBERSHIP_REQUESTS[memIndex].status = action;
    MEM_MEMBERSHIP_REQUESTS[memIndex].rejection_reason = action === "rejected" ? rejectionReason?.trim() || null : null;
    MEM_MEMBERSHIP_REQUESTS[memIndex].reviewed_by = user.id;
    MEM_MEMBERSHIP_REQUESTS[memIndex].reviewed_at = now;
    MEM_MEMBERSHIP_REQUESTS[memIndex].updated_at = now;
  }

  // 4. If approved, add student to club_members
  if (action === "approved" && applicantId) {
    try {
      await supabase.from("club_members").upsert(
        {
          id: crypto.randomUUID(),
          club_id: request.club_id,
          profile_id: applicantId,
          role: "member",
          status: "active",
          joined_at: now,
        },
        { onConflict: "club_id,profile_id" }
      );
    } catch {}
  }

  // 5. Send notification to applicant
  if (applicantId) {
    try {
      const clubName = request.club?.name || "the club";
      const title = action === "approved" ? "Membership Approved!" : "Membership Application Update";
      const message =
        action === "approved"
          ? `Congratulations! Your request to join ${clubName} has been approved. You are now an active member.`
          : rejectionReason?.trim()
          ? `Your application to join ${clubName} was not approved. Feedback: ${rejectionReason.trim()}`
          : `Your application to join ${clubName} was not approved at this time.`;

      await supabase.from("notifications").insert({
        id: crypto.randomUUID(),
        profile_id: applicantId,
        title,
        message,
        type: action === "approved" ? "membership_approved" : "membership_rejected",
        is_read: false,
      });
    } catch {}
  }

  // 6. Audit log
  await logSystemActivity({
    userId: user.id,
    action: `membership_${action}`,
    targetType: "membership_request",
    targetId: requestId,
    details: { action, rejection_reason: rejectionReason },
  });

  revalidatePath("/dashboard/club");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin");
  revalidatePath("/clubs");
  return { success: true };
}

export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ success?: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { success: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("profile_id", user.id);

  revalidatePath("/notifications");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function markAllNotificationsAsReadAction(): Promise<{ success?: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { success: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  revalidatePath("/notifications");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function adminUpdateUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database not connected." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  // Check admin role
  const { data: adminProf } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProf?.role !== "admin") {
    return { error: "Access denied. Only Campus Administrators can reassign user roles." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) {
    return { error: error.message };
  }

  // Notify the user
  try {
    await supabase.from("notifications").insert({
      profile_id: targetUserId,
      title: "Role Updated",
      message: `Your CampusHub account role has been updated to ${newRole.replace("_", " ")} by campus administration.`,
      type: "role_updated",
      is_read: false,
    });
  } catch {
    // safe fallback
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/profile");
  return { success: true };
}

// ====================================================================
// PHASE 3: EVENT REGISTRATION & ATTENDANCE ACTIONS
// ====================================================================

export async function registerForEventAction(
  eventId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to register for this event." };
  }

  // 1. Fetch event details
  let event: any = null;
  const { data: dbEvent } = await supabase
    .from("events")
    .select("*, club:clubs(id, name)")
    .eq("id", eventId)
    .maybeSingle();

  if (dbEvent) {
    event = dbEvent;
  } else {
    const seed = SEED_EVENTS.find((e) => e.id === eventId);
    if (seed) event = seed;
  }

  if (!event) {
    return { error: "Event not found." };
  }

  // 2. Validate event status & date
  if (event.status === "cancelled") {
    return { error: "This event has been cancelled." };
  }

  if (new Date(event.event_date) < new Date()) {
    return { error: "This event has already taken place. Registration is closed." };
  }

  // 3. Check existing registration
  let existingReg: any = null;
  try {
    const { data } = await supabase
      .from("event_registrations")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();
    existingReg = data;
  } catch {}

  if (!existingReg) {
    existingReg = MEM_EVENT_REGISTRATIONS.find(
      (r) => r.event_id === eventId && r.user_id === user.id && r.status === "registered"
    );
  }

  if (existingReg && existingReg.status === "registered") {
    return { error: "You are already registered for this event." };
  }

  // 4. Check capacity
  let currentCount = 0;
  try {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "registered");
    if (count !== null && count !== undefined) currentCount = count;
  } catch {}

  if (currentCount === 0) {
    currentCount = MEM_EVENT_REGISTRATIONS.filter(
      (r) => r.event_id === eventId && r.status === "registered"
    ).length;
  }

  const capacity = event.capacity || 100;
  if (currentCount >= capacity) {
    return { error: `Registration is full. Maximum capacity of ${capacity} attendees reached.` };
  }

  // 5. Insert registration into Supabase or fallback
  const regId = `reg-${Date.now()}`;
  try {
    await supabase.from("event_registrations").upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status: "registered",
        created_at: new Date().toISOString(),
        cancelled_at: null,
      },
      { onConflict: "event_id,user_id" }
    );
  } catch {}

  // Keep in-memory store in sync
  const existingMemIdx = MEM_EVENT_REGISTRATIONS.findIndex(
    (r) => r.event_id === eventId && r.user_id === user.id
  );
  if (existingMemIdx >= 0) {
    MEM_EVENT_REGISTRATIONS[existingMemIdx] = {
      ...MEM_EVENT_REGISTRATIONS[existingMemIdx],
      status: "registered",
      cancelled_at: null,
    };
  } else {
    MEM_EVENT_REGISTRATIONS.push({
      id: regId,
      event_id: eventId,
      user_id: user.id,
      status: "registered",
      created_at: new Date().toISOString(),
      cancelled_at: null,
    });
  }

  // 6. Send in-app notification
  try {
    await supabase.from("notifications").insert({
      profile_id: user.id,
      title: "Event Registration Confirmed",
      message: `You are confirmed for "${event.title}". Venue: ${event.venue}. Date: ${new Date(
        event.event_date
      ).toLocaleDateString()}.`,
      type: "event_registered",
      is_read: false,
    });
  } catch {}

  // 7. Log system activity
  await logSystemActivity({
    userId: user.id,
    action: "event_registered",
    targetType: "event",
    targetId: eventId,
    details: { event_title: event.title },
  });

  revalidatePath("/events");
  if (event.slug) revalidatePath(`/events/${event.slug}`);
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function cancelEventRegistrationAction(
  eventId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  try {
    await supabase
      .from("event_registrations")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .eq("user_id", user.id);
  } catch {}

  const existingMem = MEM_EVENT_REGISTRATIONS.find(
    (r) => r.event_id === eventId && r.user_id === user.id
  );
  if (existingMem) {
    existingMem.status = "cancelled";
    existingMem.cancelled_at = new Date().toISOString();
  }

  try {
    await supabase.from("notifications").insert({
      profile_id: user.id,
      title: "Registration Cancelled",
      message: "Your event registration has been successfully cancelled.",
      type: "event_cancelled",
      is_read: false,
    });
  } catch {}

  revalidatePath("/events");
  revalidatePath("/dashboard/student");
  return { success: true };
}

// ====================================================================
// PHASE 3: CLUB LEAD MANAGEMENT ACTIONS
// ====================================================================

export async function removeClubMemberAction(
  clubId: string,
  memberProfileId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = myProfile?.role === "admin";

  let isLead = false;
  if (!isAdmin) {
    const { data: leadCheck } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("profile_id", user.id)
      .in("role", ["president", "vice_president"])
      .maybeSingle();
    isLead = Boolean(leadCheck) || myProfile?.role === "club_lead";
  }

  if (!isAdmin && !isLead) {
    return { error: "Access denied. Only club leads or administrators can remove members." };
  }

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("profile_id", memberProfileId);

  if (error) {
    return { error: error.message };
  }

  try {
    const { data: club } = await supabase.from("clubs").select("name").eq("id", clubId).single();
    await supabase.from("notifications").insert({
      profile_id: memberProfileId,
      title: "Membership Update",
      message: `Your membership in ${club?.name || "the club"} has concluded.`,
      type: "membership_rejected",
      is_read: false,
    });
  } catch {}

  await logSystemActivity({
    userId: user.id,
    action: "member_removed",
    targetType: "club",
    targetId: clubId,
    details: { member_id: memberProfileId },
  });

  revalidatePath("/dashboard/club");
  revalidatePath("/clubs");
  return { success: true };
}

export async function createEventAction(
  formData: FormData
): Promise<{ success?: boolean; error?: string; eventId?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const clubId = formData.get("clubId")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const dateStr = formData.get("date")?.toString().trim();
  const startTime = formData.get("startTime")?.toString().trim() || "10:00";
  const endTime = formData.get("endTime")?.toString().trim() || "12:00";
  const venue = formData.get("venue")?.toString().trim();
  const capacityRaw = formData.get("capacity")?.toString().trim();
  const bannerUrl = formData.get("bannerUrl")?.toString().trim() || null;

  if (!clubId || !title || !description || !dateStr || !venue) {
    return { error: "Please fill in all required fields (Club, Title, Description, Date, Venue)." };
  }

  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : 100;
  if (isNaN(capacity) || capacity < 1) {
    return { error: "Capacity must be a positive number." };
  }

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = myProfile?.role === "admin";

  let isLead = false;
  if (!isAdmin) {
    const { data: leadCheck } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("profile_id", user.id)
      .in("role", ["president", "vice_president", "secretary", "core_member"])
      .maybeSingle();
    isLead = Boolean(leadCheck) || myProfile?.role === "club_lead";
  }

  if (!isAdmin && !isLead) {
    return { error: "You are not authorized to create events for this club." };
  }

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

  const startObj = new Date(`${dateStr}T${startTime}:00`);
  const endObj = new Date(`${dateStr}T${endTime}:00`);
  if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    return { error: "Please provide a valid date and time." };
  }
  if (endObj <= startObj) {
    return { error: "Event end time must be after start time." };
  }

  const eventDate = startObj.toISOString();
  const endDate = endObj.toISOString();
  const initialStatus = isAdmin ? "approved" : "pending_approval";

  const { data: newEvt, error: insertError } = await supabase
    .from("events")
    .insert({
      club_id: clubId,
      title,
      slug,
      description,
      event_date: eventDate,
      end_date: endDate,
      venue,
      capacity,
      banner_url: bannerUrl,
      status: initialStatus,
      created_by: user.id,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    return { error: sanitizeDatabaseError(insertError).userMessage };
  }

  // If pending approval, notify faculty coordinator
  try {
    const { data: club } = await supabase
      .from("clubs")
      .select("name, faculty_coordinator_id")
      .eq("id", clubId)
      .single();

    if (club?.faculty_coordinator_id && initialStatus === "pending_approval") {
      await supabase.from("notifications").insert({
        profile_id: club.faculty_coordinator_id,
        title: "Event Approval Request",
        message: `${club.name} submitted a new event "${title}" for faculty review and approval.`,
        type: "event_approval_request",
        is_read: false,
      });
    }
  } catch {}

  await logSystemActivity({
    userId: user.id,
    action: "event_created",
    targetType: "event",
    targetId: newEvt?.id,
    details: { title, club_id: clubId, status: initialStatus },
  });

  revalidatePath("/dashboard/club");
  revalidatePath("/dashboard/faculty");
  revalidatePath("/events");
  return { success: true, eventId: newEvt?.id };
}

export async function cancelEventAction(
  eventId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: evt } = await supabase.from("events").select("id, title, club_id, created_by").eq("id", eventId).single();
  if (!evt) return { error: "Event not found." };

  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) return { error: error.message };

  // Notify registered students
  try {
    const { data: attendees } = await supabase
      .from("event_registrations")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("status", "registered");

    if (attendees && attendees.length > 0) {
      const notifs = attendees.map((a) => ({
        profile_id: a.user_id,
        title: "Event Cancelled",
        message: `The event "${evt.title}" has been cancelled by the organizers.`,
        type: "event_cancelled",
        is_read: false,
      }));
      await supabase.from("notifications").insert(notifs);
    }
  } catch {}

  await logSystemActivity({
    userId: user.id,
    action: "event_cancelled",
    targetType: "event",
    targetId: eventId,
    details: { title: evt.title },
  });

  revalidatePath("/dashboard/club");
  revalidatePath("/events");
  return { success: true };
}

export async function createAnnouncementAction(
  clubId: string,
  title: string,
  content: string,
  isPinned: boolean = false
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  if (!title.trim() || !content.trim()) {
    return { error: "Title and content are required." };
  }

  const annId = `ann-${Date.now()}`;
  const now = new Date().toISOString();

  try {
    await supabase.from("announcements").insert({
      club_id: clubId,
      created_by: user.id,
      title: title.trim(),
      content: content.trim(),
      is_pinned: isPinned,
    });
  } catch {}

  MEM_ANNOUNCEMENTS.unshift({
    id: annId,
    club_id: clubId,
    created_by: user.id,
    title: title.trim(),
    content: content.trim(),
    is_pinned: isPinned,
    created_at: now,
    updated_at: now,
  });

  // Notify active members of this club
  try {
    const { data: club } = await supabase.from("clubs").select("name").eq("id", clubId).single();
    const clubName = club?.name || "your club";

    const { data: members } = await supabase
      .from("club_members")
      .select("profile_id")
      .eq("club_id", clubId)
      .eq("status", "active");

    if (members && members.length > 0) {
      const notifs = members.map((m) => ({
        profile_id: m.profile_id,
        title: `Announcement: ${clubName}`,
        message: `${title}: ${content.slice(0, 100)}${content.length > 100 ? "..." : ""}`,
        type: "announcement_posted",
        is_read: false,
      }));
      await supabase.from("notifications").insert(notifs);
    }
  } catch {}

  await logSystemActivity({
    userId: user.id,
    action: "announcement_created",
    targetType: "club",
    targetId: clubId,
    details: { title },
  });

  revalidatePath("/dashboard/club");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function deleteAnnouncementAction(
  announcementId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  try {
    await supabase.from("announcements").delete().eq("id", announcementId);
  } catch {}

  const memIdx = MEM_ANNOUNCEMENTS.findIndex((a) => a.id === announcementId);
  if (memIdx >= 0) {
    MEM_ANNOUNCEMENTS.splice(memIdx, 1);
  }

  revalidatePath("/dashboard/club");
  revalidatePath("/dashboard/student");
  return { success: true };
}

// ====================================================================
// PHASE 3: FACULTY & ADMIN APPROVAL ACTIONS
// ====================================================================

export async function facultyReviewEventAction({
  eventId,
  action,
  rejectionReason,
}: {
  eventId: string;
  action: "approved" | "rejected";
  rejectionReason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: evt } = await supabase
    .from("events")
    .select("*, club:clubs(*)")
    .eq("id", eventId)
    .single();

  if (!evt) return { error: "Event not found." };

  const newStatus = action === "approved" ? "approved" : "rejected";

  const { error } = await supabase
    .from("events")
    .update({
      status: newStatus,
      rejection_reason: action === "rejected" ? rejectionReason || null : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) return { error: error.message };

  // Notify creator / club leads
  try {
    const notifyId = evt.created_by;
    if (notifyId) {
      const title = action === "approved" ? "Event Approved!" : "Event Update: Changes Required";
      const message =
        action === "approved"
          ? `Your event "${evt.title}" has been reviewed and approved by faculty. It is now published.`
          : `Your event "${evt.title}" was not approved.${
              rejectionReason ? ` Reason: ${rejectionReason}` : ""
            }`;

      await supabase.from("notifications").insert({
        profile_id: notifyId,
        title,
        message,
        type: action === "approved" ? "event_approved" : "event_rejected",
        is_read: false,
      });
    }
  } catch {}

  await logSystemActivity({
    userId: user.id,
    action: action === "approved" ? "event_approved" : "event_rejected",
    targetType: "event",
    targetId: eventId,
    details: { title: evt.title, rejection_reason: rejectionReason },
  });

  revalidatePath("/dashboard/faculty");
  revalidatePath("/dashboard/club");
  revalidatePath("/events");
  return { success: true };
}

export async function facultyReviewClubAction({
  clubId,
  action,
  rejectionReason,
}: {
  clubId: string;
  action: "approved" | "rejected";
  rejectionReason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const newStatus = action === "approved" ? "approved" : "rejected";

  const { error } = await supabase
    .from("clubs")
    .update({
      status: newStatus,
      rejection_reason: action === "rejected" ? rejectionReason || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clubId);

  if (error) return { error: error.message };

  await logSystemActivity({
    userId: user.id,
    action: action === "approved" ? "club_approved" : "club_rejected",
    targetType: "club",
    targetId: clubId,
    details: { action, rejection_reason: rejectionReason },
  });

  revalidatePath("/dashboard/faculty");
  revalidatePath("/dashboard/admin");
  revalidatePath("/clubs");
  return { success: true };
}

export async function adminUpdateClubAction(
  clubId: string,
  updates: {
    status?: "approved" | "rejected" | "suspended" | "draft" | "pending_approval";
    faculty_coordinator_id?: string | null;
    is_active?: boolean;
    name?: string;
    description?: string;
    category?: string;
  }
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (prof?.role !== "admin") return { error: "Only administrators can perform this action." };

  const { error } = await supabase
    .from("clubs")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clubId);

  if (error) return { error: error.message };

  await logSystemActivity({
    userId: user.id,
    action: "club_updated",
    targetType: "club",
    targetId: clubId,
    details: updates,
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/clubs");
  return { success: true };
}

export async function adminReviewEventAction({
  eventId,
  action,
  rejectionReason,
}: {
  eventId: string;
  action: "approved" | "rejected" | "cancelled" | "restored";
  rejectionReason?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Database connection failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (prof?.role !== "admin") return { error: "Admin access required." };

  let status = "approved";
  if (action === "rejected") status = "rejected";
  if (action === "cancelled") status = "cancelled";
  if (action === "restored") status = "approved";

  const { error } = await supabase
    .from("events")
    .update({
      status,
      rejection_reason: action === "rejected" ? rejectionReason || null : null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) return { error: error.message };

  await logSystemActivity({
    userId: user.id,
    action: `admin_event_${action}`,
    targetType: "event",
    targetId: eventId,
    details: { action, rejection_reason: rejectionReason },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/events");
  return { success: true };
}

export async function getEventAttendeesAction(eventId: string) {
  return await getEventAttendees(eventId);
}


