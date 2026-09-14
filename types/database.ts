export type UserRole = 'student' | 'club_member' | 'club_lead' | 'faculty_coordinator' | 'admin';
export type MembershipRole = 'president' | 'vice_president' | 'secretary' | 'treasurer' | 'core_member' | 'member';
export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'alumni';
export type MembershipRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type EventStatus = 'draft' | 'submitted' | 'approved' | 'published' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
  year_of_study: string | null;
  phone?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  interests?: string[] | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  parent_organization_id: string | null;
  created_at: string;
  // Relational joins
  parent_organization?: Organization | null;
  clubs?: Club[];
  club_count?: number;
}

export interface Club {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo_url: string | null;
  banner_url: string | null;
  faculty_coordinator_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relational joins
  organization?: Organization;
  faculty_coordinator?: Profile | null;
  members?: ClubMemberWithProfile[];
  teams?: TeamWithMembers[];
  events?: Event[];
  president?: Profile | null;
  vice_president?: Profile | null;
  member_count?: number;
  team_count?: number;
  event_count?: number;
}

export interface ClubMember {
  id: string;
  club_id: string;
  profile_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string;
}

export interface ClubMemberWithProfile extends ClubMember {
  profile: Profile;
}

export interface Team {
  id: string;
  club_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  profile_id: string;
  is_lead: boolean;
  joined_at: string;
}

export interface TeamMemberWithProfile extends TeamMember {
  profile: Profile;
}

export interface TeamWithMembers extends Team {
  members: TeamMemberWithProfile[];
  lead?: Profile | null;
  member_count?: number;
}

export interface Event {
  id: string;
  club_id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  end_date: string | null;
  venue: string;
  capacity: number;
  banner_url: string | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relational joins
  club?: Club;
  creator?: Profile | null;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformStatistics {
  totalClubs: number;
  totalOrganizations: number;
  upcomingEventsCount: number;
  totalTeams: number;
  totalMembers: number;
}

export interface MembershipRequest {
  id: string;
  club_id: string;
  user_id: string;
  status: MembershipRequestStatus;
  message: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipRequestWithDetails extends MembershipRequest {
  club?: Club;
  user?: Profile;
  reviewer?: Profile | null;
}

