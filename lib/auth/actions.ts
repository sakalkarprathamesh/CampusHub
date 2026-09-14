"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDashboardPathForRole } from "./roles";
import { UserRole } from "@/types/database";

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

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database configuration error. Please check Supabase credentials." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Failed to sign in. Please try again." };
  }

  // Determine redirection target
  let targetPath = "/dashboard";
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    targetPath = redirectTo;
  } else {
    // Fetch profile role to redirect straight to appropriate dashboard
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    targetPath = getDashboardPathForRole(profile?.role as UserRole);
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
  const department = formData.get("department")?.toString().trim() || "";
  const yearOfStudy = formData.get("yearOfStudy")?.toString().trim() || "";

  if (!email || !password || !fullName) {
    return { error: "Full name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database configuration error. Please check Supabase credentials." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        department,
        year_of_study: yearOfStudy,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure profile row exists
  if (data.user) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName,
          department: department || null,
          year_of_study: yearOfStudy || null,
          role: "student",
        },
        { onConflict: "id" }
      );
    } catch {
      // safe fallback if trigger handled it
    }
  }

  // If email confirmation is enabled, user session won't be active immediately
  if (!data.session) {
    return {
      success:
        "Account created! Please check your email to confirm your account or sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
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
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard", "layout");
  return { success: "Profile successfully updated!" };
}

export async function requestMembershipAction(
  clubId: string,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database connection failed." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to submit a club membership request." };
  }

  // Check if already active member
  const { data: existingMember } = await supabase
    .from("club_members")
    .select("id, status")
    .eq("club_id", clubId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existingMember && existingMember.status === "active") {
    return { error: "You are already an active member of this club." };
  }

  // Check if already pending request
  const { data: pendingReq } = await supabase
    .from("membership_requests")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingReq) {
    return { error: "You already have a pending membership request for this club." };
  }

  // Insert membership request
  const { data: insertedRequest, error: insertError } = await supabase
    .from("membership_requests")
    .insert({
      club_id: clubId,
      user_id: user.id,
      message: message?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Fetch club leads / coordinator to send notification
  try {
    const { data: club } = await supabase
      .from("clubs")
      .select("name, faculty_coordinator_id")
      .eq("id", clubId)
      .single();

    const clubName = club?.name || "the club";

    // Find club president/vice_president
    const { data: leads } = await supabase
      .from("club_members")
      .select("profile_id")
      .eq("club_id", clubId)
      .in("role", ["president", "vice_president"]);

    const leadIds = new Set<string>();
    if (leads) {
      leads.forEach((l) => leadIds.add(l.profile_id));
    }
    if (club?.faculty_coordinator_id) {
      leadIds.add(club.faculty_coordinator_id);
    }

    // Insert notifications for club leadership
    if (leadIds.size > 0) {
      const notifs = Array.from(leadIds).map((pId) => ({
        profile_id: pId,
        title: "New Membership Request",
        message: `A student has requested to join ${clubName}.`,
        type: "membership_request",
        is_read: false,
      }));
      await supabase.from("notifications").insert(notifs);
    }
  } catch {
    // Non-blocking notification dispatch
  }

  revalidatePath(`/clubs`);
  revalidatePath(`/dashboard`, "layout");
  return { success: true };
}

export async function cancelMembershipRequestAction(
  requestId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Database connection failed." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("membership_requests")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clubs`);
  revalidatePath(`/dashboard`, "layout");
  return { success: true };
}

export async function reviewMembershipRequestAction({
  requestId,
  action,
}: {
  requestId: string;
  action: "approved" | "rejected";
}): Promise<{ success?: boolean; error?: string }> {
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

  // Fetch the request details
  const { data: request, error: reqError } = await supabase
    .from("membership_requests")
    .select("*, club:clubs(id, name)")
    .eq("id", requestId)
    .single();

  if (reqError || !request) {
    return { error: "Membership request not found." };
  }

  // Update request status
  const { error: updateError } = await supabase
    .from("membership_requests")
    .update({
      status: action,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  // If approved, create or update club_members record
  if (action === "approved") {
    const { error: memberError } = await supabase.from("club_members").upsert(
      {
        club_id: request.club_id,
        profile_id: request.user_id,
        role: "member",
        status: "active",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "club_id,profile_id" }
    );

    if (memberError) {
      console.error("Error creating club member record:", memberError);
    }
  }

  // Send notification to the applicant
  try {
    const clubName = (request.club as any)?.name || "the club";
    const notificationTitle =
      action === "approved"
        ? `Membership Approved: ${clubName}`
        : `Membership Update: ${clubName}`;
    const notificationMessage =
      action === "approved"
        ? `Congratulations! Your request to join ${clubName} has been approved. You are now an active member.`
        : `Your application to join ${clubName} was not approved at this time.`;

    await supabase.from("notifications").insert({
      profile_id: request.user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: action === "approved" ? "membership_approved" : "membership_rejected",
      is_read: false,
    });
  } catch {
    // Non-blocking notification
  }

  revalidatePath("/dashboard", "layout");
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

