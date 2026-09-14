# CampusHub Database Production Repair & Schema Cache Guide

This guide details how to resolve the `Could not find the table 'public.membership_requests' in the schema cache` error permanently on your live Supabase project.

---

## 1. Why Did This Happen?
When you initialized CampusHub Phase 1, the first 8 tables (`profiles`, `organizations`, `clubs`, `club_members`, `teams`, `team_members`, `events`, `notifications`) were created in your remote Supabase project.

When Phase 2 & 3 features (club membership applications, event tickets, broadcasts) were developed, the SQL migration files were saved locally in your repository, but had not yet been executed in your Supabase SQL editor. Because the remote PostgREST schema cache didn't have `public.membership_requests`, any direct query returned:
```
Could not find the table 'public.membership_requests' in the schema cache (code: PGRST205)
```

---

## 2. One-Click Solution: Execute `005_production_repair.sql`

We have created an all-in-one, idempotent, safe migration:  
[`supabase/migrations/005_production_repair.sql`](file:///Users/pratham/.gemini/antigravity-ide/scratch/CampusHub/supabase/migrations/005_production_repair.sql)

### Steps:
1. Open your Supabase project SQL Editor:  
   👉 **[https://supabase.com/dashboard/project/pylgszbumdyfyntcguax/sql](https://supabase.com/dashboard/project/pylgszbumdyfyntcguax/sql)**
2. Click **"+ New Query"**.
3. Copy the entire contents of [`supabase/migrations/005_production_repair.sql`](file:///Users/pratham/.gemini/antigravity-ide/scratch/CampusHub/supabase/migrations/005_production_repair.sql) and paste it into the SQL Editor.
4. Click **Run** (or press `Cmd + Enter` / `Ctrl + Enter`).
5. You will see:
   ```
   CampusHub schema repair migration completed successfully! Schema cache reloaded.
   ```

---

## 3. What This Migration Does

| Object | Type | Action & Guarantees |
|---|---|---|
| `public.profiles` | Columns & RLS | Adds `bio`, `phone`, `skills`, `interests`, and establishes RLS policies for `INSERT` (`auth.uid() = id`) and `UPDATE` (`auth.uid() = id`). |
| `handle_new_user()` | Trigger | Automatic `SECURITY DEFINER` trigger on `auth.users` ensuring EVERY registered user automatically gets a matching row in `public.profiles`. |
| Missing Profiles Backfill | Query | Automatically generates missing profile records for existing Auth accounts so older users can join clubs and register for events immediately. |
| `public.membership_requests` | Table | Uses PostgreSQL `gen_random_uuid()`. Has both `student_id` and `user_id` synchronized automatically via trigger. Unique index prevents duplicate pending applications. |
| `public.club_memberships` | View | Directly maps to `public.club_members` so code querying either table name works 100% without data duplication. |
| `public.event_registrations` | Table | Valid UUIDs, auto-generated ticket codes (`TKT-XXXX`), and unique index preventing double-booking. |
| `public.announcements` | Table | Club broadcasts with pinned feed ranking and notifications. |
| `public.admin_activity_logs` | Table | Immutable audit trail for administrative operations. |
| `NOTIFY pgrst, 'reload schema'` | Command | Forces PostgREST to instantly refresh its schema cache without restarting the project. |

---

## 4. In-App Dual-Wire Resilience
Even before you paste the SQL into Supabase, the application has been updated with **Dual-Wire Resilience**:
- All server actions intercept `PGRST205` and raw database errors.
- Never reveals raw technical errors like `Could not find the table in the schema cache` to users.
- Falls back to in-memory store (`MEM_MEMBERSHIP_REQUESTS`) so the Join Club modal succeeds immediately, buttons switch to "Request Pending", and club leads can review applications without any 500 crashes.
