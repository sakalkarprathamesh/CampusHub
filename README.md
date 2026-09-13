# CampusHub — College Club Management Platform

> **Connect. Collaborate. Create.**  
> A centralized student organization, club, leadership, and event directory platform built for **MIT-ADT University**.

![CampusHub Banner](https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80)

---

## 📌 Phase 1 Overview

**CampusHub** is a modern "Campus OS" engineered to eliminate fragmented communication by providing a single source of truth for college clubs, executive leadership, specialized wings/teams, and campus-wide events.

### Phase 1 Features Included:
- **Landing Page (`/`)**: Hero banner, live database counters, real-time database connection status badge, featured apex organizations, featured clubs, and upcoming events preview.
- **Apex Communities (`/organizations/[slug]`)**: Visual hierarchy tree connecting governing bodies (Student Council, Technical & Innovation Community, Cultural & Creative Community) to constituent student clubs.
- **Club Directory (`/clubs`)**: Real-time search (name, category, description), category filters, and community filters with instant empty and loading states.
- **Club Detail Page (`/clubs/[slug]`)**: Executive leadership profile cards (Presidents, Vice Presidents, Faculty Coordinators), specialized functional teams with Team Leads, member rosters, and past/upcoming club events.
- **Events Directory (`/events`)**: Tabbed switch between *Upcoming Events* and *Past Events Archive*, keyword search, and organizing club filters.
- **Event Detail Page (`/events/[slug]`)**: Event banner, logistics breakdown, venue capacity, organizing chapter profile, and "Student Registration — Coming Soon" placeholder.
- **Diagnostics Page (`/supabase-test`)**: Developer connection test suite reporting live table counts, latency/connectivity status, and query errors without exposing secrets.
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
- **Client Libraries**: `@supabase/supabase-js`, `@supabase/ssr`
- **Validation**: `zod`
- **Utility**: `clsx`, `tailwind-merge`

---

## 🚀 Setup & Execution Guide

Follow these 9 exact steps to set up, connect to Supabase, and run CampusHub:

### 1. Install Packages
Ensure you have Node.js (v18.18+ or v20+) installed, then install project dependencies:
```bash
npm install
```

### 2. Create a Supabase Project
1. Navigate to [https://supabase.com](https://supabase.com) and create a free account or sign in.
2. Click **New Project**, select an organization, name your project (e.g., `campushub-mitadt`), and set a secure database password.
3. Once provisioned, navigate to **Project Settings** -> **API**.

### 3. Configure `.env.local`
Create a `.env.local` file in the root directory (copied from `.env.local.example`):
```bash
cp .env.local.example .env.local
```

Paste your project credentials into `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key-here
```
> **Note**: Do not commit `.env.local` to version control. It is already included in `.gitignore`.

### 4. Run the SQL Migration
1. In the Supabase Dashboard, open the **SQL Editor** from the left sidebar.
2. Open [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) from this repository, copy its contents, and paste it into the Supabase SQL editor.
3. Click **Run**. This creates:
   - 4 Enum types (`user_role`, `membership_role`, `membership_status`, `event_status`)
   - 8 Relational tables (`profiles`, `organizations`, `clubs`, `club_members`, `teams`, `team_members`, `events`, `notifications`)
   - Foreign keys, cascading behaviors, and indexes
   - Row Level Security (RLS) public read policies

### 5. Run Seed Data
1. Still in the Supabase **SQL Editor**, open [`supabase/seed.sql`](supabase/seed.sql).
2. Copy its contents, paste it into the editor, and click **Run**.
3. This populates:
   - 3 Apex Organizations (*Student Council*, *Technical & Innovation Community*, *Cultural & Creative Community*)
   - 7 Student Clubs (*Impact MIT ADT*, *Criya*, *Coding Club*, *Robotics Club*, *Entrepreneurship Cell*, *Cultural Club*, *Photography Club*)
   - 17 Student & Faculty Profiles
   - 19 Club Leadership and Core Member assignments
   - 15 Specialized Functional Teams with designated Team Leads
   - 10 Events (7 published future events and 3 past events)
4. The script is idempotent and uses `ON CONFLICT DO NOTHING`, so it is safe to run multiple times.

### 6. Start the Local Development App
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or `http://localhost:3001` if port 3000 is occupied) in your browser.

### 7. Test Supabase Connectivity
Visit **[http://localhost:3000/supabase-test](http://localhost:3000/supabase-test)** in your browser.
- When Supabase is connected, the badge displays **Supabase Connected** (green) with real-time table record counts.
- When `.env.local` is not configured, the app seamlessly falls back to **Prototype Mode** with local seed data.
- If invalid credentials or network failures occur, it displays **Database Error** with error diagnostics.

### 8. Run Lint Checks
Verify that all TypeScript code passes ESLint checks:
```bash
npm run lint
```

### 9. Run Production Build
Ensure the production bundle compiles without errors:
```bash
npm run build
npm run start
```

---

## 🗄️ Relational Database Schema & Foreign Keys

The database model is built with strict relational integrity:

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

### Foreign Key Relationships:
* `organizations.id` &rarr; `clubs.organization_id` (1:N)
* `clubs.id` &rarr; `club_members.club_id` (1:N)
* `profiles.id` &rarr; `club_members.profile_id` (1:N)
* `clubs.id` &rarr; `teams.club_id` (1:N)
* `teams.id` &rarr; `team_members.team_id` (1:N)
* `profiles.id` &rarr; `team_members.profile_id` (1:N)
* `clubs.id` &rarr; `events.club_id` (1:N)
* `profiles.id` &rarr; `notifications.profile_id` (1:N)

---

## 🔮 Phase 2 Scope Boundaries (Coming Soon)

The following features are intentionally reserved for Phase 2:
- **Authentication**: Single Sign-On (SSO) with university credentials.
- **Event Registration & Digital Passes**: QR attendance scanning.
- **Faculty Approvals**: Formal budget proposals and document workflows.
- All Phase 1 action buttons for joining or registering are clearly labeled with **"Coming Soon (Phase 2)"**.

---

## 📜 Disclaimer
CampusHub is a prototype developed for demonstration purposes with fictionalized student records for MIT-ADT University.
