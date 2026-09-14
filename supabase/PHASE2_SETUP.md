# CampusHub Phase 2 — Database Setup Guide

This guide walks you through applying the Phase 2 migration to your Supabase PostgreSQL database to enable Authentication, User Profiles, Role-Based Access Control, and the Club Membership Request Workflow.

---

## 1. Apply Migration `002_phase2_auth_roles.sql`

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (`CampusHub`).
3. Navigate to the **SQL Editor** in the left sidebar.
4. Click **New Query**.
5. Copy and paste the entire contents of [`supabase/migrations/002_phase2_auth_roles.sql`](./migrations/002_phase2_auth_roles.sql).
6. Click **Run**.
7. Confirm the query executes successfully with status `Success. No rows returned`.

---

## 2. What This Migration Does

- **Enum Extension**: Adds `'club_member'` to `user_role` type if not already present.
- **Profile Enhancements**: Adds `bio`, `phone`, `skills`, and `interests` columns to `profiles`.
- **Foreign Key**: Connects `profiles.id` to `auth.users(id)` with `ON DELETE CASCADE`.
- **Membership Requests Table**:
  - `membership_requests` with columns: `id`, `club_id`, `user_id`, `status` (`pending`, `approved`, `rejected`, `cancelled`), `message`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`.
  - Partial unique index `idx_unique_pending_membership_request` preventing multiple pending requests for the same club by the same user.
- **Automated Profile Creation**:
  - `handle_new_user()` trigger on `auth.users` creates a `profiles` entry on every signup with `role = 'student'`.
- **Role Security Trigger**:
  - `check_profile_role_update()` trigger prevents users from self-escalating their own `role` column via client-side updates.
- **Row Level Security (RLS)**:
  - Configures RLS policies for `profiles`, `membership_requests`, `club_members`, `events`, and `notifications`.

---

## 3. Recommended Test Accounts

To test the role-based dashboards and workflows, register the following accounts via `/register` (or create them in Supabase Auth > Users) and assign their roles in the SQL Editor:

| Email | Password | Role | Description |
|---|---|---|---|
| `admin@campushub.edu` | `CampusAdmin2026!` | `admin` | Full platform administrator |
| `faculty@campushub.edu` | `CampusFaculty2026!` | `faculty_coordinator` | Faculty advisor for clubs |
| `lead@campushub.edu` | `CampusLead2026!` | `club_lead` | Club President / Lead |
| `student@campushub.edu` | `CampusStudent2026!` | `student` | Normal student applicant |

### Role Assignment SQL Script

After creating the users via `/register` or Supabase Auth UI, run this SQL in Supabase SQL Editor to assign roles:

```sql
-- Assign Admin Role
UPDATE profiles
SET role = 'admin', full_name = 'Campus Admin', department = 'Dean of Students'
WHERE email = 'admin@campushub.edu';

-- Assign Faculty Coordinator Role
UPDATE profiles
SET role = 'faculty_coordinator', full_name = 'Dr. Elena Vance', department = 'School of Engineering'
WHERE email = 'faculty@campushub.edu';

-- Assign Club Lead Role
UPDATE profiles
SET role = 'club_lead', full_name = 'Marcus Brody', department = 'Computer Science', year_of_study = 'Senior'
WHERE email = 'lead@campushub.edu';

-- Link Marcus Brody as President of ACM Student Chapter
DO $$
DECLARE
  acm_id UUID;
  marcus_id UUID;
BEGIN
  SELECT id INTO acm_id FROM clubs WHERE slug = 'acm-student-chapter' LIMIT 1;
  SELECT id INTO marcus_id FROM profiles WHERE email = 'lead@campushub.edu' LIMIT 1;

  IF acm_id IS NOT NULL AND marcus_id IS NOT NULL THEN
    INSERT INTO club_members (club_id, profile_id, role, status)
    VALUES (acm_id, marcus_id, 'president', 'active')
    ON CONFLICT (club_id, profile_id) DO UPDATE SET role = 'president', status = 'active';
  END IF;
END $$;
```

---

## 4. Supabase Email Verification Settings (Important for Local Development)

For local development convenience:
1. In Supabase Dashboard, go to **Authentication** > **Providers** > **Email**.
2. If you want instant logins without clicking email links, toggle **Confirm email** to **OFF** (or test with confirming via Supabase Auth emails or Inbucket).
3. Set **Site URL** to `http://localhost:3000`.
4. Add `http://localhost:3000/**` to **Redirect URLs**.
