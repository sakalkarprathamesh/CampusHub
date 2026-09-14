# CampusHub Phase 3 — Database Setup Guide

This guide walks you through applying the Phase 3 migration to your Supabase PostgreSQL database to enable Event Registrations, Club Announcements, System Activity Logs, and Extended Approval Workflows.

---

## 1. Apply Migration `004_phase3_core_features.sql`

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (`CampusHub`).
3. Navigate to the **SQL Editor** in the left sidebar.
4. Click **New Query**.
5. Copy and paste the entire contents of [`supabase/migrations/004_phase3_core_features.sql`](./migrations/004_phase3_core_features.sql).
6. Click **Run**.
7. Confirm the query executes successfully with status `Success. No rows returned`.

---

## 2. What This Migration Adds

- **`event_registrations` Table**:
  - Columns: `id`, `event_id`, `user_id`, `status` (`registered`, `cancelled`), `created_at`, `cancelled_at`.
  - Unique constraint on `(event_id, user_id)` preventing duplicate registrations.
- **`announcements` Table**:
  - Columns: `id`, `club_id`, `created_by`, `title`, `content`, `is_pinned`, `created_at`, `updated_at`.
  - Enables club leaders to post broadcast updates to their members.
- **`admin_activity_logs` Table**:
  - Columns: `id`, `user_id`, `action`, `target_type`, `target_id`, `details`, `created_at`.
  - Audits important actions across the platform (club approvals, rejections, event reviews, role changes).
- **Events Extensions**:
  - Adds `rejection_reason`, `reviewed_by`, and `reviewed_at`.
- **Clubs Extensions**:
  - Adds `status` (`draft`, `pending_approval`, `approved`, `rejected`, `suspended`), `rejection_reason`, and `created_by`.
- **Membership Requests Extensions**:
  - Adds `rejection_reason`.
- **Row Level Security (RLS)**:
  - Configures secure access policies for all newly added tables.
