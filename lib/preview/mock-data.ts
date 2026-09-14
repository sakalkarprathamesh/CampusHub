import { PreviewRole } from "./config";

export interface MockStudentData {
  profile: {
    fullName: string;
    email: string;
    role: string;
    department: string;
    yearOfStudy: string;
    bio: string;
    skills: string[];
    interests: string[];
  };
  metrics: {
    joinedClubs: number;
    pendingRequests: number;
    upcomingEvents: number;
  };
  memberships: Array<{
    id: string;
    clubName: string;
    clubSlug: string;
    role: string;
    status: string;
    joinedAt: string;
    category: string;
  }>;
  pendingRequests: Array<{
    id: string;
    clubName: string;
    clubSlug: string;
    status: string;
    message: string;
    submittedAt: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    slug: string;
    clubName: string;
    date: string;
    venue: string;
    category: string;
  }>;
}

export interface MockClubLeadData {
  profile: {
    fullName: string;
    email: string;
    role: string;
    department: string;
    yearOfStudy: string;
    clubTitle: string;
  };
  club: {
    name: string;
    slug: string;
    category: string;
    description: string;
    memberCount: number;
    teamCount: number;
    eventsCount: number;
    charterStatus: string;
  };
  pendingRequests: Array<{
    id: string;
    applicantName: string;
    applicantEmail: string;
    department: string;
    yearOfStudy: string;
    message: string;
    appliedAt: string;
  }>;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    joinedAt: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    leadName: string;
    memberCount: number;
  }>;
}

export interface MockFacultyData {
  profile: {
    fullName: string;
    email: string;
    role: string;
    department: string;
    title: string;
  };
  assignedClubs: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    presidentName: string;
    membersCount: number;
    charterStatus: string;
    lastReportDate: string;
  }>;
  pendingEventApprovals: Array<{
    id: string;
    title: string;
    clubName: string;
    eventDate: string;
    venue: string;
    expectedAttendees: number;
    status: string;
  }>;
  recentActions: Array<{
    id: string;
    action: string;
    clubName: string;
    timestamp: string;
  }>;
}

export interface MockAdminData {
  profile: {
    fullName: string;
    email: string;
    role: string;
    department: string;
  };
  platformStats: {
    totalClubs: number;
    totalOrganizations: number;
    totalUsers: number;
    totalEvents: number;
    pendingCharters: number;
  };
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    department: string;
    createdAt: string;
  }>;
  systemHealth: {
    database: string;
    authService: string;
    storageService: string;
    rlsStatus: string;
  };
}

export function getMockStudentData(): MockStudentData {
  return {
    profile: {
      fullName: "Alex Rivera",
      email: "alex.rivera@gmail.com",
      role: "student",
      department: "School of Computing",
      yearOfStudy: "Junior (Year 3)",
      bio: "Passionate about full-stack web applications, AI tools, and campus community engagement.",
      skills: ["React", "TypeScript", "Python", "Tailwind CSS"],
      interests: ["Hackathons", "Robotics", "Open Source", "Design"],
    },
    metrics: {
      joinedClubs: 2,
      pendingRequests: 1,
      upcomingEvents: 3,
    },
    memberships: [
      {
        id: "m-1",
        clubName: "Coding Club",
        clubSlug: "coding-club",
        role: "Core Member",
        status: "active",
        joinedAt: "August 2025",
        category: "Technical",
      },
      {
        id: "m-2",
        clubName: "Robotics & AI Society",
        clubSlug: "robotics-society",
        role: "General Member",
        status: "active",
        joinedAt: "October 2025",
        category: "Engineering",
      },
    ],
    pendingRequests: [
      {
        id: "r-1",
        clubName: "Design & Innovation Collective",
        clubSlug: "design-collective",
        status: "pending",
        message: "Looking forward to helping create event banners and digital branding for club activities.",
        submittedAt: "2 days ago",
      },
    ],
    upcomingEvents: [
      {
        id: "e-1",
        title: "Campus Annual Hackathon 2026",
        slug: "campus-hackathon-2026",
        clubName: "Coding Club",
        date: "October 18, 2026 • 09:00 AM",
        venue: "Main Auditorium & Innovation Lab",
        category: "Competition",
      },
      {
        id: "e-2",
        title: "Hands-on Autonomous Drones Workshop",
        slug: "autonomous-drones-workshop",
        clubName: "Robotics & AI Society",
        date: "November 05, 2026 • 02:00 PM",
        venue: "Engineering Building Room 402",
        category: "Workshop",
      },
      {
        id: "e-3",
        title: "UI/UX Spring Jam Showcase",
        slug: "ui-ux-spring-jam",
        clubName: "Design & Innovation Collective",
        date: "November 22, 2026 • 11:30 AM",
        venue: "Student Activity Center",
        category: "Exhibition",
      },
    ],
  };
}

export function getMockClubLeadData(): MockClubLeadData {
  return {
    profile: {
      fullName: "Marcus Brody",
      email: "marcus.brody@campushub.edu",
      role: "club_lead",
      department: "School of Computing",
      yearOfStudy: "Senior (Year 4)",
      clubTitle: "President, Coding Club",
    },
    club: {
      name: "Coding Club",
      slug: "coding-club",
      category: "Technical",
      description: "Premier student developer community fostering algorithmic problem-solving and open source hackathons.",
      memberCount: 128,
      teamCount: 4,
      eventsCount: 5,
      charterStatus: "Active & Certified",
    },
    pendingRequests: [
      {
        id: "pr-1",
        applicantName: "Sarah Chen",
        applicantEmail: "sarah.chen@gmail.com",
        department: "Computer Science",
        yearOfStudy: "Sophomore (Year 2)",
        message: "I have experience with React and Next.js and would love to build web projects for the club.",
        appliedAt: "Yesterday at 4:30 PM",
      },
      {
        id: "pr-2",
        applicantName: "David Kumar",
        applicantEmail: "david.kumar@outlook.com",
        department: "Data Science",
        yearOfStudy: "Freshman (Year 1)",
        message: "Eager to learn competitive programming and join the algorithms study group.",
        appliedAt: "2 days ago",
      },
      {
        id: "pr-3",
        applicantName: "Priya Nair",
        applicantEmail: "priya.nair@yahoo.com",
        department: "Information Technology",
        yearOfStudy: "Junior (Year 3)",
        message: "Looking to mentor junior students and coordinate weekend coding workshops.",
        appliedAt: "4 days ago",
      },
    ],
    members: [
      {
        id: "mem-1",
        name: "Marcus Brody",
        email: "marcus.brody@campushub.edu",
        role: "President",
        department: "Computer Science",
        joinedAt: "August 2023",
      },
      {
        id: "mem-2",
        name: "Ayesha Khan",
        email: "ayesha.khan@mituniversity.edu.in",
        role: "Vice President",
        department: "Software Engineering",
        joinedAt: "January 2024",
      },
      {
        id: "mem-3",
        name: "Leo Zhang",
        email: "leo.zhang@gmail.com",
        role: "Technical Lead",
        department: "Computer Science",
        joinedAt: "September 2024",
      },
      {
        id: "mem-4",
        name: "Rohan Verma",
        email: "rohan.verma@outlook.com",
        role: "Treasurer",
        department: "Information Systems",
        joinedAt: "September 2024",
      },
    ],
    teams: [
      { id: "tm-1", name: "Web Development Team", leadName: "Leo Zhang", memberCount: 16 },
      { id: "tm-2", name: "Competitive Programming", leadName: "Ayesha Khan", memberCount: 24 },
      { id: "tm-3", name: "Open Source Initiatives", leadName: "Marcus Brody", memberCount: 12 },
      { id: "tm-4", name: "Event Management Team", leadName: "Rohan Verma", memberCount: 10 },
    ],
  };
}

export function getMockFacultyData(): MockFacultyData {
  return {
    profile: {
      fullName: "Dr. Elena Vance",
      email: "faculty@campushub.edu",
      role: "faculty_coordinator",
      department: "School of Engineering",
      title: "Faculty Coordinator & Associate Professor",
    },
    assignedClubs: [
      {
        id: "ac-1",
        name: "Robotics & AI Society",
        slug: "robotics-society",
        category: "Engineering",
        presidentName: "Vikram Sharma",
        membersCount: 142,
        charterStatus: "Charter Verified",
        lastReportDate: "September 10, 2026",
      },
      {
        id: "ac-2",
        name: "Aeromodelling & Drone Club",
        slug: "aeromodelling-club",
        category: "Aerospace",
        presidentName: "Neha Joshi",
        membersCount: 88,
        charterStatus: "Charter Verified",
        lastReportDate: "September 02, 2026",
      },
    ],
    pendingEventApprovals: [
      {
        id: "ea-1",
        title: "Autonomous Rover Showcase & Live Trial",
        clubName: "Robotics & AI Society",
        eventDate: "October 24, 2026",
        venue: "North Campus Quadrangle",
        expectedAttendees: 250,
        status: "Awaiting Faculty Sign-off",
      },
      {
        id: "ea-2",
        title: "Inter-College Flight Exhibition 2026",
        clubName: "Aeromodelling & Drone Club",
        eventDate: "November 14, 2026",
        venue: "University Sports Grounds",
        expectedAttendees: 400,
        status: "Awaiting Safety Approval",
      },
    ],
    recentActions: [
      {
        id: "ra-1",
        action: "Annual Club Charter Renewal Approved",
        clubName: "Robotics & AI Society",
        timestamp: "September 05, 2026",
      },
      {
        id: "ra-2",
        action: "Lab Equipment Requisition Endorsed",
        clubName: "Aeromodelling & Drone Club",
        timestamp: "August 28, 2026",
      },
    ],
  };
}

export function getMockAdminData(): MockAdminData {
  return {
    profile: {
      fullName: "Campus Admin",
      email: "admin@campushub.edu",
      role: "admin",
      department: "Dean of Student Affairs",
    },
    platformStats: {
      totalClubs: 14,
      totalOrganizations: 6,
      totalUsers: 1240,
      totalEvents: 38,
      pendingCharters: 2,
    },
    recentUsers: [
      {
        id: "usr-1",
        fullName: "Alex Rivera",
        email: "alex.rivera@gmail.com",
        role: "student",
        department: "Computer Science",
        createdAt: "2026-09-12",
      },
      {
        id: "usr-2",
        fullName: "Marcus Brody",
        email: "marcus.brody@campushub.edu",
        role: "club_lead",
        department: "School of Computing",
        createdAt: "2026-08-20",
      },
      {
        id: "usr-3",
        fullName: "Dr. Elena Vance",
        email: "faculty@campushub.edu",
        role: "faculty_coordinator",
        department: "School of Engineering",
        createdAt: "2026-08-01",
      },
      {
        id: "usr-4",
        fullName: "Sophia Martinez",
        email: "sophia.m@mituniversity.edu.in",
        role: "student",
        department: "School of Design",
        createdAt: "2026-09-14",
      },
      {
        id: "usr-5",
        fullName: "Campus Admin",
        email: "admin@campushub.edu",
        role: "admin",
        department: "Dean of Student Affairs",
        createdAt: "2026-01-01",
      },
    ],
    systemHealth: {
      database: "Operational (PostgreSQL Supabase Connected)",
      authService: "Operational (Email + Password JWT)",
      storageService: "Operational (Media CDN)",
      rlsStatus: "Enabled on all public tables",
    },
  };
}
