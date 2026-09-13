# CampusHub — College Club Management Platform

> **Connect. Collaborate. Create.**  
> A centralized student organization, club, leadership, and event directory platform built for **MIT-ADT University**.

![CampusHub Banner](https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80)

---

## 📌 Phase 1 Overview

**CampusHub** is a modern "Campus OS" engineered to eliminate fragmented communication by providing a single source of truth for college clubs, executive leadership, specialized wings/teams, and campus-wide events.

### Phase 1 Features Included:
- **Landing Page (`/`)**: Hero banner, real-time database counters, featured apex organizations, featured clubs, and upcoming events preview.
- **Apex Communities (`/organizations/[slug]`)**: Visual hierarchy tree connecting governing bodies (Student Council, Technical & Innovation Community, Cultural & Creative Community) to constituent student clubs.
- **Club Directory (`/clubs`)**: Search and multi-facet filtering by category and parent organization with instant empty/loading states.
- **Club Detail Page (`/clubs/[slug]`)**: Executive leadership profile cards (Presidents, Vice Presidents, Faculty Coordinators), specialized functional teams with Team Leads, member rosters, and past/upcoming club events.
- **Events Directory (`/events`)**: Tabbed upcoming vs past event archive with search and organizing club filters.
- **Event Detail Page (`/events/[slug]`)**: Event banner, logistics breakdown, venue capacity, organizing chapter profile, and "Student Registration — Coming Soon" placeholder.
- **About Page (`/about`)**: Architecture overview, platform vision, Phase 2 roadmap, and demo disclaimers.
- **Relational PostgreSQL Schema**: Real SQL migrations and realistic MIT-ADT College seed datasets.
- **Zero-Config Seed Fallback Mode**: Instantly runnable locally out of the box even before remote Supabase configuration.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Components by default)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/)
- **Client Library**: `@supabase/supabase-js`
- **Validation**: `zod`
- **Utility**: `clsx`, `tailwind-merge`

---

## 📂 Project Architecture

```
CampusHub/
├── app/
│   ├── about/
│   │   └── page.tsx              # Platform vision & Phase 2 roadmap
│   ├── clubs/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # Comprehensive club detail view
│   │   └── page.tsx              # Club directory with search & filters
│   ├── events/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # Event details & logistics
│   │   └── page.tsx              # Tabbed events directory
│   ├── organizations/
│   │   └── [slug]/
│   │       └── page.tsx          # Community hierarchy & constituent clubs
│   ├── globals.css               # Campus OS design system styles
│   ├── layout.tsx                # Root layout with Navbar, Banner, Footer
│   ├── not-found.tsx             # 404 handler for missing slugs
│   └── page.tsx                  # Home landing page
├── components/
│   ├── clubs/
│   │   ├── ClubCard.tsx
│   │   ├── ClubDirectoryClient.tsx
│   │   ├── ClubFilters.tsx
│   │   ├── LeadershipCard.tsx
│   │   └── TeamCard.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventDirectoryClient.tsx
│   │   └── EventFilters.tsx
│   ├── layout/
│   │   ├── DatabaseStatusBanner.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── organizations/
│   │   └── OrgCard.tsx
│   └── ui/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Breadcrumbs.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── lib/
│   ├── data/
│   │   ├── index.ts              # Unified data fetching layer (Supabase + fallback)
│   │   └── seed-data.ts          # Strongly-typed relational seed dataset
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   └── utils.ts                  # Class merging, date formatters, badges
├── public/                       # Static assets
├── supabase/
│   ├── migrations/
│   │   └── 20260101000000_initial_schema.sql  # DDL with enums, tables, indexes, RLS
│   └── seed.sql                  # Comprehensive SQL seed data
├── types/
│   └── database.ts               # Relational TypeScript interfaces
├── .env.local.example            # Environment variable template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🗄️ Relational Database Schema

The database model is built with foreign keys, timestamps, UUID primary keys, and indexes:

```
[organizations]
   │
   ├──< [clubs] ────< [teams] ────< [team_members] >──── [profiles]
   │       │
   │       ├──< [club_members] >───────────────────────── [profiles]
   │       │
   │       └──< [events] >─────────────────────────────── [profiles (created_by)]
   │
   └── [notifications] >───────────────────────────────── [profiles]
```

### Core Tables & Enums:
1. `profiles`: Student and faculty profiles with departments, roles, and avatar URLs.
2. `organizations`: Apex governing councils (e.g. Student Council, Technical Community).
3. `clubs`: Active student clubs with categories, banners, contact info, and faculty coordinators.
4. `club_members`: Relational table with roles (`president`, `vice_president`, `core_member`, `member`).
5. `teams`: Functional tracks within clubs (e.g., UI/UX, AI/ML, PR, Drone Autonomy).
6. `team_members`: Team membership with `is_lead` flag.
7. `events`: Scheduled campus activities with capacity, venue, dates, and statuses.
8. `notifications`: Profile-specific announcements.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ (v24+ recommended)
- **npm**: v9+

### 2. Installation
```bash
# Clone or navigate to project directory
cd CampusHub

# Install dependencies
npm install
```

### 3. Running in Prototype Mode (Zero-Config)
CampusHub includes an integrated fallback data layer with all 7 clubs, organizations, leadership, teams, and events pre-loaded. You can start developing immediately without configuring a database:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Connecting to Live Supabase PostgreSQL

To connect a live Supabase instance:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Populate with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. In the **Supabase SQL Editor**, run:
   - `supabase/migrations/20260101000000_initial_schema.sql` (Creates enums, tables, indexes, and RLS policies)
   - `supabase/seed.sql` (Populates MIT-ADT demo records)
5. Restart your local server:
   ```bash
   npm run dev
   ```

---

## 🧪 Build & Linting Verification

```bash
# Run ESLint checks
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 🔮 Phase 2 Roadmap

- [ ] **Student & Faculty Single Sign-On (SSO)** via university email domains.
- [ ] **Club Proposal & Budget Approval Pipeline** with multi-level faculty coordinator review.
- [ ] **Digital Passes & Dynamic QR Code Gate Attendance Scanning**.
- [ ] **Student Event Registration & Attendance Badging**.
- [ ] **Audit Logs & Administrative Export Reports**.

---

## 📜 Disclaimer
This software is an educational prototype developed for demonstration purposes with fictionalized student records for MIT-ADT University.
