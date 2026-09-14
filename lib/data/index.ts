import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  supabaseConfig,
} from "@/lib/supabase/server";
import {
  SEED_PROFILES,
  SEED_ORGANIZATIONS,
  SEED_CLUBS,
  SEED_CLUB_MEMBERS,
  SEED_TEAMS,
  SEED_TEAM_MEMBERS,
  SEED_EVENTS,
  SEED_NOTIFICATIONS,
} from "./seed-data";
import {
  Organization,
  Club,
  ClubMemberWithProfile,
  TeamWithMembers,
  Event,
  PlatformStatistics,
  Profile,
  EventRegistration,
  Announcement,
  AdminActivityLog,
} from "@/types/database";

export type ConnectionStatus = "connected" | "prototype" | "error";

export interface TableCheckResult {
  table: string;
  status: "ok" | "error" | "fallback";
  count?: number;
  error?: string;
}

export interface DatabaseStatus {
  status: ConnectionStatus;
  label: "Supabase Connected" | "Prototype Mode" | "Database Error";
  message: string;
  error?: string;
  isConfigured: boolean;
  urlExists: boolean;
  keyExists: boolean;
  hostname: string | null;
  isReachable: boolean;
  tableResults: TableCheckResult[];
  counts?: {
    organizations: number;
    clubs: number;
    profiles: number;
    teams: number;
    events: number;
    club_members?: number;
    team_members?: number;
    notifications?: number;
  };
}

const ALL_8_TABLES = [
  "organizations",
  "clubs",
  "profiles",
  "club_members",
  "teams",
  "team_members",
  "events",
  "notifications",
] as const;

let cachedDbStatus: { data: DatabaseStatus; timestamp: number } | null = null;
const CACHE_TTL_MS = 10000; // 10 seconds cache to prevent repeated blocking on navigation

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const now = Date.now();
  if (cachedDbStatus && now - cachedDbStatus.timestamp < CACHE_TTL_MS) {
    return cachedDbStatus.data;
  }

  const urlExists = supabaseConfig.urlExists;
  const keyExists = supabaseConfig.keyExists;
  const hostname = supabaseConfig.hostname;

  // Case 1: Credentials not configured
  if (!isSupabaseConfigured) {
    if (typeof window === "undefined") {
      console.log(
        "[CampusHub Supabase Diagnostic] URL exists:",
        urlExists,
        "| Public key exists:",
        keyExists,
        "| Hostname:",
        hostname || "none"
      );
    }

    const res: DatabaseStatus = {
      status: "prototype",
      label: "Prototype Mode",
      message:
        "Running with local MIT-ADT demonstration dataset. Supabase credentials not yet configured.",
      isConfigured: false,
      urlExists,
      keyExists,
      hostname,
      isReachable: false,
      tableResults: ALL_8_TABLES.map((table) => ({
        table,
        status: "fallback",
      })),
      counts: {
        organizations: SEED_ORGANIZATIONS.length,
        clubs: SEED_CLUBS.length,
        profiles: SEED_PROFILES.length,
        teams: SEED_TEAMS.length,
        events: SEED_EVENTS.length,
        club_members: SEED_CLUB_MEMBERS.length,
        team_members: SEED_TEAM_MEMBERS.length,
        notifications: SEED_NOTIFICATIONS.length,
      },
    };
    cachedDbStatus = { data: res, timestamp: now };
    return res;
  }

  // Safe diagnostic log (never prints key)
  if (typeof window === "undefined") {
    console.log(
      "[CampusHub Supabase Diagnostic] URL exists:",
      urlExists,
      "| Public key exists:",
      keyExists,
      "| Hostname:",
      hostname
    );
  }

  // Case 2: Reachability check with fast timeout (2 seconds)
  let isReachable = false;
  try {
    const reachCheck = await fetch(`${supabaseConfig.url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: supabaseConfig.key!,
      },
      signal: AbortSignal.timeout(2000),
    });
    // Any HTTP status code received (200, 401, 404, etc.) proves host is reached
    isReachable = reachCheck.status > 0;
  } catch (reachErr: any) {
    const errMsg = reachErr?.message || String(reachErr);
    if (typeof window === "undefined") {
      console.warn(
        "[CampusHub Supabase Diagnostic] Supabase URL is unreachable. Hostname:",
        hostname,
        "| Error:",
        errMsg
      );
    }

    const errRes: DatabaseStatus = {
      status: "error",
      label: "Database Error",
      message:
        "Supabase URL is unreachable. Check .env.local, project status, and internet connection.",
      error: errMsg,
      isConfigured: true,
      urlExists,
      keyExists,
      hostname,
      isReachable: false,
      tableResults: ALL_8_TABLES.map((table) => ({
        table,
        status: "error",
        error: "Host unreachable",
      })),
      counts: {
        organizations: SEED_ORGANIZATIONS.length,
        clubs: SEED_CLUBS.length,
        profiles: SEED_PROFILES.length,
        teams: SEED_TEAMS.length,
        events: SEED_EVENTS.length,
        club_members: SEED_CLUB_MEMBERS.length,
        team_members: SEED_TEAM_MEMBERS.length,
        notifications: SEED_NOTIFICATIONS.length,
      },
    };
    cachedDbStatus = { data: errRes, timestamp: now };
    return errRes;
  }


  // Case 3: URL is reachable — test each of the 8 tables individually
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      status: "error",
      label: "Database Error",
      message: "Client initialization failed.",
      isConfigured: true,
      urlExists,
      keyExists,
      hostname,
      isReachable: true,
      tableResults: ALL_8_TABLES.map((table) => ({
        table,
        status: "error",
        error: "Client null",
      })),
    };
  }

  const tableResults: TableCheckResult[] = [];
  const counts: Record<string, number> = {};
  let firstError: { table: string; message: string; code?: string } | null = null;

  for (const table of ALL_8_TABLES) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        tableResults.push({ table, status: "error", error: error.message });
        if (!firstError) {
          firstError = { table, message: error.message, code: error.code };
        }
      } else {
        tableResults.push({ table, status: "ok", count: count ?? 0 });
        counts[table] = count ?? 0;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      tableResults.push({ table, status: "error", error: msg });
      if (!firstError) {
        firstError = { table, message: msg };
      }
    }
  }

  if (firstError) {
    if (typeof window === "undefined") {
      console.warn(
        "[CampusHub Supabase Diagnostic] Table query failed:",
        firstError.table,
        "| Error:",
        firstError.message
      );
    }

    return {
      status: "error",
      label: "Database Error",
      message: `Query failed on table '${firstError.table}': ${firstError.message}`,
      error: `Table [${firstError.table}] query error: ${firstError.message}${
        firstError.code ? ` (code: ${firstError.code})` : ""
      }`,
      isConfigured: true,
      urlExists,
      keyExists,
      hostname,
      isReachable: true,
      tableResults,
      counts: {
        organizations: counts.organizations ?? SEED_ORGANIZATIONS.length,
        clubs: counts.clubs ?? SEED_CLUBS.length,
        profiles: counts.profiles ?? SEED_PROFILES.length,
        teams: counts.teams ?? SEED_TEAMS.length,
        events: counts.events ?? SEED_EVENTS.length,
        club_members: counts.club_members ?? SEED_CLUB_MEMBERS.length,
        team_members: counts.team_members ?? SEED_TEAM_MEMBERS.length,
        notifications: counts.notifications ?? SEED_NOTIFICATIONS.length,
      },
    };
  }

  if (typeof window === "undefined") {
    console.log(
      "[CampusHub Supabase Diagnostic] All 8 tables verified successfully on Supabase:",
      hostname
    );
  }

  return {
    status: "connected",
    label: "Supabase Connected",
    message:
      "Successfully connected to remote Supabase PostgreSQL database. All 8 tables verified.",
    isConfigured: true,
    urlExists,
    keyExists,
    hostname,
    isReachable: true,
    tableResults,
    counts: {
      organizations: counts.organizations ?? 0,
      clubs: counts.clubs ?? 0,
      profiles: counts.profiles ?? 0,
      teams: counts.teams ?? 0,
      events: counts.events ?? 0,
      club_members: counts.club_members ?? 0,
      team_members: counts.team_members ?? 0,
      notifications: counts.notifications ?? 0,
    },
  };
}

// Helper to resolve seed profiles by ID
function findProfile(id: string): Profile | undefined {
  return SEED_PROFILES.find((p) => p.id === id);
}

// Helper to hydrate a Club object from seed tables
function hydrateSeedClub(club: Club): Club {
  const org = SEED_ORGANIZATIONS.find((o) => o.id === club.organization_id);
  const faculty = club.faculty_coordinator_id ? findProfile(club.faculty_coordinator_id) : null;

  // Members
  const members = SEED_CLUB_MEMBERS.filter((cm) => cm.club_id === club.id).map((cm) => ({
    ...cm,
    profile: findProfile(cm.profile_id)!,
  }));

  const presidentMember = members.find((m) => m.role === "president");
  const vpMember = members.find((m) => m.role === "vice_president");

  // Teams
  const teams = SEED_TEAMS.filter((t) => t.club_id === club.id).map((t) => {
    const tMembers = SEED_TEAM_MEMBERS.filter((tm) => tm.team_id === t.id).map((tm) => ({
      ...tm,
      profile: findProfile(tm.profile_id)!,
    }));
    const lead = tMembers.find((tm) => tm.is_lead)?.profile || null;
    return {
      ...t,
      members: tMembers,
      lead,
      member_count: tMembers.length,
    };
  });

  // Events
  const events = SEED_EVENTS.filter((e) => e.club_id === club.id);

  return {
    ...club,
    organization: org,
    faculty_coordinator: faculty,
    members,
    teams,
    events,
    president: presidentMember ? presidentMember.profile : null,
    vice_president: vpMember ? vpMember.profile : null,
    member_count: members.length,
    team_count: teams.length,
    event_count: events.length,
  };
}

// Helper to hydrate an Event object from seed tables
function hydrateSeedEvent(event: Event): Event {
  const club = SEED_CLUBS.find((c) => c.id === event.club_id);
  const hydratedClub = club ? hydrateSeedClub(club) : undefined;
  const creator = event.created_by ? findProfile(event.created_by) : null;

  return {
    ...event,
    club: hydratedClub,
    creator,
  };
}

export async function getStatistics(): Promise<PlatformStatistics> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const [
        { count: clubsCount },
        { count: orgsCount },
        { count: upcomingCount },
        { count: teamsCount },
        { count: membersCount },
      ] = await Promise.all([
        supabase.from("clubs").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("organizations").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", new Date().toISOString()).eq("status", "published"),
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("club_members").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);

      return {
        totalClubs: clubsCount ?? SEED_CLUBS.length,
        totalOrganizations: orgsCount ?? SEED_ORGANIZATIONS.length,
        upcomingEventsCount: upcomingCount ?? SEED_EVENTS.filter((e) => new Date(e.event_date) >= new Date() && e.status === "published").length,
        totalTeams: teamsCount ?? SEED_TEAMS.length,
        totalMembers: membersCount ?? SEED_CLUB_MEMBERS.length,
      };
    } catch {
      // Fallback to seed
    }
  }

  const now = new Date();
  const upcomingEvents = SEED_EVENTS.filter(
    (e) => new Date(e.event_date) >= now && e.status === "published"
  );

  return {
    totalClubs: SEED_CLUBS.length,
    totalOrganizations: SEED_ORGANIZATIONS.length,
    upcomingEventsCount: upcomingEvents.length,
    totalTeams: SEED_TEAMS.length,
    totalMembers: SEED_CLUB_MEMBERS.length,
  };
}

export async function getOrganizations(): Promise<Organization[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select(`
          *,
          clubs:clubs(*)
        `)
        .order("name", { ascending: true });

      if (!error && data) {
        return data.map((org) => ({
          ...org,
          club_count: org.clubs?.length || 0,
        }));
      }
    } catch {
      // Fallback to seed
    }
  }

  return SEED_ORGANIZATIONS.map((org) => {
    const clubs = SEED_CLUBS.filter((c) => c.organization_id === org.id);
    return {
      ...org,
      clubs,
      club_count: clubs.length,
    };
  });
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select(`
          *,
          clubs:clubs(*)
        `)
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return {
          ...data,
          club_count: data.clubs?.length || 0,
        };
      }
    } catch {
      // Fallback
    }
  }

  const org = SEED_ORGANIZATIONS.find((o) => o.slug.toLowerCase() === slug.toLowerCase());
  if (!org) return null;

  const clubs = SEED_CLUBS.filter((c) => c.organization_id === org.id).map(hydrateSeedClub);
  return {
    ...org,
    clubs,
    club_count: clubs.length,
  };
}

export interface ClubFilterOptions {
  search?: string;
  category?: string;
  orgSlug?: string;
  limit?: number;
}

export async function getClubs(options: ClubFilterOptions = {}): Promise<Club[]> {
  const { search, category, orgSlug, limit } = options;
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      let query = supabase
        .from("clubs")
        .select(`
          *,
          organization:organizations(*),
          faculty_coordinator:profiles(*)
        `)
        .eq("is_active", true);

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search && search.trim() !== "") {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query.order("name", { ascending: true });

      if (!error && data) {
        let results = data;
        if (orgSlug && orgSlug !== "all") {
          results = results.filter((c) => c.organization?.slug === orgSlug);
        }
        if (limit) {
          results = results.slice(0, limit);
        }
        return results;
      }
    } catch {
      // Fallback
    }
  }

  let results = SEED_CLUBS.map(hydrateSeedClub);

  if (category && category !== "all") {
    results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (orgSlug && orgSlug !== "all") {
    results = results.filter((c) => c.organization?.slug === orgSlug);
  }

  if (search && search.trim() !== "") {
    const term = search.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }

  if (limit) {
    results = results.slice(0, limit);
  }

  return results;
}

export async function getClubBySlug(slug: string): Promise<Club | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select(`
          *,
          organization:organizations(*),
          faculty_coordinator:profiles(*)
        `)
        .eq("slug", slug)
        .single();

      if (!error && data) {
        // Fetch leadership, teams, and events
        const [leadership, teams, events] = await Promise.all([
          getClubLeadership(data.id),
          getClubTeams(data.id),
          getClubEvents(data.id),
        ]);

        const pres = leadership.find((m) => m.role === "president")?.profile || null;
        const vp = leadership.find((m) => m.role === "vice_president")?.profile || null;

        return {
          ...data,
          members: leadership,
          teams,
          events,
          president: pres,
          vice_president: vp,
          member_count: leadership.length,
          team_count: teams.length,
          event_count: events.length,
        };
      }
    } catch {
      // Fallback
    }
  }

  const club = SEED_CLUBS.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!club) return null;

  return hydrateSeedClub(club);
}

export async function getClubLeadership(clubId: string): Promise<ClubMemberWithProfile[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("club_id", clubId)
        .eq("status", "active");

      if (!error && data) {
        return data as ClubMemberWithProfile[];
      }
    } catch {
      // Fallback
    }
  }

  return SEED_CLUB_MEMBERS.filter((cm) => cm.club_id === clubId).map((cm) => ({
    ...cm,
    profile: findProfile(cm.profile_id)!,
  }));
}

export async function getClubTeams(clubId: string): Promise<TeamWithMembers[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          members:team_members(
            *,
            profile:profiles(*)
          )
        `)
        .eq("club_id", clubId)
        .order("name", { ascending: true });

      if (!error && data) {
        return data.map((team) => {
          const lead = team.members?.find((m: { is_lead: boolean }) => m.is_lead)?.profile || null;
          return {
            ...team,
            lead,
            member_count: team.members?.length || 0,
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  return SEED_TEAMS.filter((t) => t.club_id === clubId).map((t) => {
    const members = SEED_TEAM_MEMBERS.filter((tm) => tm.team_id === t.id).map((tm) => ({
      ...tm,
      profile: findProfile(tm.profile_id)!,
    }));
    const lead = members.find((m) => m.is_lead)?.profile || null;
    return {
      ...t,
      members,
      lead,
      member_count: members.length,
    };
  });
}

export async function getClubEvents(clubId: string): Promise<Event[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          club:clubs(*),
          creator:profiles(*)
        `)
        .eq("club_id", clubId)
        .order("event_date", { ascending: true });

      if (!error && data) {
        return data as Event[];
      }
    } catch {
      // Fallback
    }
  }

  return SEED_EVENTS.filter((e) => e.club_id === clubId).map(hydrateSeedEvent);
}

export interface EventFilterOptions {
  search?: string;
  clubSlug?: string;
  category?: string;
  limit?: number;
}

export async function getUpcomingEvents(options: EventFilterOptions = {}): Promise<Event[]> {
  const { search, clubSlug, category, limit } = options;
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      let query = supabase
        .from("events")
        .select(`
          *,
          club:clubs(
            *,
            organization:organizations(*)
          ),
          creator:profiles(*)
        `)
        .gte("event_date", now)
        .eq("status", "published")
        .order("event_date", { ascending: true });

      if (search && search.trim() !== "") {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        let results = data as Event[];
        if (clubSlug && clubSlug !== "all") {
          results = results.filter((e) => e.club?.slug === clubSlug);
        }
        if (category && category !== "all") {
          results = results.filter((e) => e.club?.category === category);
        }
        if (limit) {
          results = results.slice(0, limit);
        }
        return results;
      }
    } catch {
      // Fallback
    }
  }

  const nowDate = new Date();
  let results = SEED_EVENTS.filter(
    (e) => new Date(e.event_date) >= nowDate && e.status === "published"
  ).map(hydrateSeedEvent);

  if (clubSlug && clubSlug !== "all") {
    results = results.filter((e) => e.club?.slug === clubSlug);
  }

  if (category && category !== "all") {
    results = results.filter((e) => e.club?.category === category);
  }

  if (search && search.trim() !== "") {
    const term = search.toLowerCase().trim();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.venue.toLowerCase().includes(term) ||
        e.club?.name.toLowerCase().includes(term)
    );
  }

  // Sort chronologically ascending for upcoming
  results.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  if (limit) {
    results = results.slice(0, limit);
  }

  return results;
}

export async function getPastEvents(options: EventFilterOptions = {}): Promise<Event[]> {
  const { search, clubSlug, category, limit } = options;
  const now = new Date().toISOString();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      let query = supabase
        .from("events")
        .select(`
          *,
          club:clubs(
            *,
            organization:organizations(*)
          ),
          creator:profiles(*)
        `)
        .lt("event_date", now)
        .neq("status", "draft")
        .order("event_date", { ascending: false });

      if (search && search.trim() !== "") {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        let results = data as Event[];
        if (clubSlug && clubSlug !== "all") {
          results = results.filter((e) => e.club?.slug === clubSlug);
        }
        if (category && category !== "all") {
          results = results.filter((e) => e.club?.category === category);
        }
        if (limit) {
          results = results.slice(0, limit);
        }
        return results;
      }
    } catch {
      // Fallback
    }
  }

  const nowDate = new Date();
  let results = SEED_EVENTS.filter((e) => new Date(e.event_date) < nowDate && e.status !== "draft").map(hydrateSeedEvent);

  if (clubSlug && clubSlug !== "all") {
    results = results.filter((e) => e.club?.slug === clubSlug);
  }

  if (category && category !== "all") {
    results = results.filter((e) => e.club?.category === category);
  }

  if (search && search.trim() !== "") {
    const term = search.toLowerCase().trim();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.venue.toLowerCase().includes(term) ||
        e.club?.name.toLowerCase().includes(term)
    );
  }

  // Sort descending for past
  results.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  if (limit) {
    results = results.slice(0, limit);
  }

  return results;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          club:clubs(
            *,
            organization:organizations(*),
            faculty_coordinator:profiles(*)
          ),
          creator:profiles(*)
        `)
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return data as Event;
      }
    } catch {
      // Fallback
    }
  }

  const event = SEED_EVENTS.find((e) => e.slug.toLowerCase() === slug.toLowerCase());
  if (!event) return null;

  return hydrateSeedEvent(event);
}

export async function getCategories(): Promise<string[]> {
  const clubs = await getClubs();
  const categories = Array.from(new Set(clubs.map((c) => c.category)));
  return categories.sort();
}

// ====================================================================
// PHASE 3: EVENT REGISTRATIONS, ANNOUNCEMENTS & ADMIN ACTIVITY LOGS
// ====================================================================

// In-memory fallback stores (used if remote tables have not yet been migrated)
export const MEM_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: "reg-sample-01",
    event_id: "c1111111-1111-1111-1111-111111111101",
    user_id: "b1111111-1111-1111-1111-111111111103",
    status: "registered",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    cancelled_at: null,
  },
];

export const MEM_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-01",
    club_id: "22222222-2222-2222-2222-222222222201", // Coding Club
    created_by: "b1111111-1111-1111-1111-111111111101", // Aarav Sharma
    title: "HackMIT 2026 Orientation & Problem Statements",
    content: "Greetings coders! HackMIT 2026 orientation begins this Friday at 4 PM in Ramanujan Hall. Teams will receive problem statements for Web3, AI, and Smart Campus tracks. Bring your laptops!",
    is_pinned: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "ann-02",
    club_id: "22222222-2222-2222-2222-222222222202", // Robotics Club
    created_by: "b1111111-1111-1111-1111-111111111102", // Priya Patel
    title: "Autonomous Bot Workshop Component Kits Distributed",
    content: "Microcontroller kits (ESP32 & Motor Drivers) are now ready for pickup at Innovation Lab Room 302 for all registered workshop attendees. Please show your student ID.",
    is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "ann-03",
    club_id: "22222222-2222-2222-2222-222222222203", // Design Club
    created_by: "b1111111-1111-1111-1111-111111111101",
    title: "UX/UI Design Challenge Submissions Open",
    content: "Submissions for the Campus Redesign Figma Challenge are now officially open. Submit your interactive prototypes before Sunday midnight.",
    is_pinned: true,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

export const MEM_ADMIN_LOGS: AdminActivityLog[] = [
  {
    id: "log-01",
    user_id: "a1111111-1111-1111-1111-111111111101",
    action: "club_approved",
    target_type: "club",
    target_id: "22222222-2222-2222-2222-222222222201",
    details: { club_name: "Coding Club", note: "Approved for current academic year" },
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "log-02",
    user_id: "a1111111-1111-1111-1111-111111111101",
    action: "event_approved",
    target_type: "event",
    target_id: "c1111111-1111-1111-1111-111111111101",
    details: { title: "HackMIT 2026: Annual 36-Hour Hackathon" },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export async function getUserRegisteredEvents(
  userId: string
): Promise<{ event: Event; registration: EventRegistration }[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          *,
          event:events(
            *,
            club:clubs(
              *,
              organization:organizations(*)
            )
          )
        `)
        .eq("user_id", userId)
        .eq("status", "registered")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          event: item.event as Event,
          registration: {
            id: item.id,
            event_id: item.event_id,
            user_id: item.user_id,
            status: item.status,
            created_at: item.created_at,
            cancelled_at: item.cancelled_at,
          },
        }));
      }
    } catch {
      // Safe fallback
    }
  }

  // Fallback to in-memory registrations
  const userRegs = MEM_EVENT_REGISTRATIONS.filter(
    (r) => r.user_id === userId && r.status === "registered"
  );
  const result: { event: Event; registration: EventRegistration }[] = [];

  for (const reg of userRegs) {
    let evt = SEED_EVENTS.find((e) => e.id === reg.event_id);
    if (!evt && supabase) {
      try {
        const { data } = await supabase.from("events").select("*, club:clubs(*)").eq("id", reg.event_id).maybeSingle();
        if (data) evt = data;
      } catch {}
    }
    if (evt) {
      result.push({
        event: hydrateSeedEvent(evt),
        registration: reg,
      });
    }
  }

  return result;
}

export async function getEventRegistrationStatus(
  eventId: string,
  userId?: string | null
): Promise<{
  isRegistered: boolean;
  registration: EventRegistration | null;
  registeredCount: number;
}> {
  let registeredCount = 0;
  let userRegistration: EventRegistration | null = null;
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "registered");

      if (count !== null && count !== undefined) {
        registeredCount = count;
      }

      if (userId) {
        const { data } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", eventId)
          .eq("user_id", userId)
          .eq("status", "registered")
          .maybeSingle();

        if (data) {
          userRegistration = data as EventRegistration;
        }
      }

      return {
        isRegistered: Boolean(userRegistration),
        registration: userRegistration,
        registeredCount,
      };
    } catch {
      // Fallback
    }
  }

  // Fallback from MEM_EVENT_REGISTRATIONS
  const memRegs = MEM_EVENT_REGISTRATIONS.filter(
    (r) => r.event_id === eventId && r.status === "registered"
  );
  registeredCount = memRegs.length;

  if (userId) {
    const found = memRegs.find((r) => r.user_id === userId);
    if (found) userRegistration = found;
  }

  return {
    isRegistered: Boolean(userRegistration),
    registration: userRegistration,
    registeredCount,
  };
}

export async function getEventAttendees(eventId: string): Promise<EventRegistration[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          *,
          user:profiles(*)
        `)
        .eq("event_id", eventId)
        .eq("status", "registered")
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data as EventRegistration[];
      }
    } catch {
      // Fallback
    }
  }

  const memRegs = MEM_EVENT_REGISTRATIONS.filter(
    (r) => r.event_id === eventId && r.status === "registered"
  );
  return memRegs.map((r) => ({
    ...r,
    user: findProfile(r.user_id) || {
      id: r.user_id,
      full_name: "Student Attendee",
      email: "student@campushub.edu",
      avatar_url: null,
      department: "Engineering",
      year_of_study: "Year 2",
      role: "student",
      created_at: r.created_at,
      updated_at: r.created_at,
    },
  }));
}

export async function getAnnouncementsForClub(clubId: string): Promise<Announcement[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          club:clubs(name, slug),
          author:profiles(full_name, avatar_url, role)
        `)
        .eq("club_id", clubId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as Announcement[];
      }
    } catch {
      // Fallback
    }
  }

  const mem = MEM_ANNOUNCEMENTS.filter((a) => a.club_id === clubId);
  return mem.map((a) => {
    const club = SEED_CLUBS.find((c) => c.id === a.club_id);
    const author = findProfile(a.created_by);
    return {
      ...a,
      club,
      author,
    };
  });
}

export async function getRecentAnnouncementsForUser(
  clubIds: string[]
): Promise<Announcement[]> {
  const supabase = getSupabaseServerClient();
  if (supabase && clubIds.length > 0) {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          club:clubs(name, slug),
          author:profiles(full_name, avatar_url, role)
        `)
        .in("club_id", clubIds)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        return data as Announcement[];
      }
    } catch {
      // Fallback
    }
  }

  const mem = MEM_ANNOUNCEMENTS.filter(
    (a) => clubIds.length === 0 || clubIds.includes(a.club_id)
  );
  return mem.slice(0, 5).map((a) => {
    const club = SEED_CLUBS.find((c) => c.id === a.club_id);
    const author = findProfile(a.created_by);
    return {
      ...a,
      club,
      author,
    };
  });
}

export async function getPendingEventsForFaculty(
  facultyUserId: string,
  isAdmin: boolean = false
): Promise<Event[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      let query = supabase
        .from("events")
        .select(`
          *,
          club:clubs(*),
          creator:profiles(*)
        `)
        .in("status", ["pending_approval", "submitted"])
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        const { data: facultyClubs } = await supabase
          .from("clubs")
          .select("id")
          .eq("faculty_coordinator_id", facultyUserId);

        const clubIds = facultyClubs?.map((c) => c.id) || [];
        if (clubIds.length === 0) return [];
        query = query.in("club_id", clubIds);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as Event[];
      }
    } catch {
      // Fallback
    }
  }

  // Seed fallback
  return SEED_EVENTS.filter((e) => e.status === "submitted").map(hydrateSeedEvent);
}

export async function getAllEventsForAdmin(): Promise<(Event & { registrations_count: number })[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          club:clubs(*),
          creator:profiles(*)
        `)
        .order("event_date", { ascending: false });

      if (!error && data) {
        return data.map((evt) => ({
          ...evt,
          registrations_count: 0,
        }));
      }
    } catch {
      // Fallback
    }
  }

  return SEED_EVENTS.map((e) => ({
    ...hydrateSeedEvent(e),
    registrations_count: 0,
  }));
}

export async function getAdminActivityLogs(limit: number = 30): Promise<AdminActivityLog[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select(`
          *,
          user:profiles(*)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as AdminActivityLog[];
      }
    } catch {
      // Fallback
    }
  }

  return MEM_ADMIN_LOGS.slice(0, limit).map((l) => ({
    ...l,
    user: l.user_id ? findProfile(l.user_id) : null,
  }));
}

export async function logSystemActivity({
  userId,
  action,
  targetType,
  targetId,
  details = {},
}: {
  userId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any>;
}): Promise<void> {
  const logEntry: AdminActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId || null,
    action,
    target_type: targetType,
    target_id: targetId || null,
    details,
    created_at: new Date().toISOString(),
  };

  MEM_ADMIN_LOGS.unshift(logEntry);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("admin_activity_logs").insert({
        user_id: logEntry.user_id,
        action: logEntry.action,
        target_type: logEntry.target_type,
        target_id: logEntry.target_id,
        details: logEntry.details,
      });
    } catch {
      // Non-blocking
    }
  }
}

