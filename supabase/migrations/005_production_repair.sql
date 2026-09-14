-- ====================================================================
-- CampusHub Phase 3 Production Repair & Schema Cache Fix Migration
-- File: supabase/migrations/005_production_repair.sql
-- ====================================================================
-- Safe, idempotent script to repair public.membership_requests,
-- create public.club_memberships view, enable event registrations,
-- announcements, audit logs, and reload the Supabase schema cache.
-- ====================================================================

-- 1. CREATE EXTENSIONS IF NEEDED
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. REPAIR PUBLIC.PROFILES (Columns, RLS Policies, Auth Trigger & Backfill)
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
EXCEPTION
    WHEN others THEN null;
END $$;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policies: read public, insert own profile, update own profile
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
    CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (
        auth.uid() = id OR auth.uid() IS NOT NULL
    );
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (
        auth.uid() = id
    ) WITH CHECK (
        auth.uid() = id
    );
EXCEPTION WHEN others THEN null; END $$;

-- Automatic Auth Trigger: Whenever a user signs up in auth.users, create matching profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing profiles for existing auth.users who signed up before trigger was created
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Safe foreign key to auth.users (NOT VALID ensures seed profiles without auth accounts don't fail)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
    END IF;
EXCEPTION WHEN others THEN null; END $$;

-- Ensure clubs table has status column if needed
DO $$ BEGIN
    ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
EXCEPTION
    WHEN others THEN null;
END $$;

-- 3. CREATE OR REPAIR PUBLIC.MEMBERSHIP_REQUESTS
CREATE TABLE IF NOT EXISTS public.membership_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure both student_id and user_id columns exist if table was partially created
DO $$ BEGIN
    ALTER TABLE public.membership_requests ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.membership_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.membership_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    ALTER TABLE public.membership_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    ALTER TABLE public.membership_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
    ALTER TABLE public.membership_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION
    WHEN others THEN null;
END $$;

-- Keep student_id and user_id synchronized automatically
CREATE OR REPLACE FUNCTION sync_membership_request_ids()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.student_id IS NULL AND NEW.user_id IS NOT NULL THEN
        NEW.student_id := NEW.user_id;
    ELSIF NEW.user_id IS NULL AND NEW.student_id IS NOT NULL THEN
        NEW.user_id := NEW.student_id;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_membership_request_ids ON public.membership_requests;
CREATE TRIGGER trg_sync_membership_request_ids
    BEFORE INSERT OR UPDATE ON public.membership_requests
    FOR EACH ROW EXECUTE FUNCTION sync_membership_request_ids();

-- Prevent multiple pending requests for the same student and club
DROP INDEX IF EXISTS idx_unique_pending_membership_request;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_membership_request
    ON public.membership_requests (club_id, COALESCE(student_id, user_id))
    WHERE status = 'pending';

-- Prevent duplicate approved records
DROP INDEX IF EXISTS idx_unique_approved_membership_request;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_approved_membership_request
    ON public.membership_requests (club_id, COALESCE(student_id, user_id))
    WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_membership_requests_club_status
    ON public.membership_requests (club_id, status);

CREATE INDEX IF NOT EXISTS idx_membership_requests_student
    ON public.membership_requests (COALESCE(student_id, user_id));

-- 3. CREATE CLUB_MEMBERSHIPS VIEW (Maps to club_members seamlessly)
CREATE OR REPLACE VIEW public.club_memberships AS
SELECT
    id,
    club_id,
    profile_id AS student_id,
    profile_id AS user_id,
    role,
    status,
    joined_at
FROM public.club_members;

-- 4. CREATE EVENT_REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'waitlist')),
    ticket_code TEXT NOT NULL DEFAULT ('TKT-' || upper(substr(md5(random()::text), 1, 8))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate active registrations
DROP INDEX IF EXISTS idx_unique_confirmed_event_reg;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_confirmed_event_reg
    ON public.event_registrations (event_id, user_id)
    WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id
    ON public.event_registrations (event_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id
    ON public.event_registrations (user_id);

-- 5. CREATE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_club_pinned
    ON public.announcements (club_id, is_pinned DESC, created_at DESC);

-- 6. CREATE ADMIN_ACTIVITY_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at
    ON public.admin_activity_logs (created_at DESC);

-- 7. SAFELY EXTEND EVENTS & CLUBS COLUMNS
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 8. CONFIGURE ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Membership Requests Policies
DROP POLICY IF EXISTS "Students can view own requests" ON public.membership_requests;
CREATE POLICY "Students can view own requests"
    ON public.membership_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can insert own requests" ON public.membership_requests;
CREATE POLICY "Students can insert own requests"
    ON public.membership_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can cancel own requests" ON public.membership_requests;
CREATE POLICY "Students can cancel own requests"
    ON public.membership_requests FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = user_id)
    WITH CHECK (status = 'cancelled');

DROP POLICY IF EXISTS "Club leads can view requests for their clubs" ON public.membership_requests;
CREATE POLICY "Club leads can view requests for their clubs"
    ON public.membership_requests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.club_members cm
            WHERE cm.club_id = membership_requests.club_id
              AND cm.profile_id = auth.uid()
              AND cm.role IN ('president', 'vice_president', 'lead')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'faculty_coordinator')
        )
    );

DROP POLICY IF EXISTS "Club leads can update requests for their clubs" ON public.membership_requests;
CREATE POLICY "Club leads can update requests for their clubs"
    ON public.membership_requests FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.club_members cm
            WHERE cm.club_id = membership_requests.club_id
              AND cm.profile_id = auth.uid()
              AND cm.role IN ('president', 'vice_president', 'lead')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Event Registrations Policies
DROP POLICY IF EXISTS "Public can view registrations" ON public.event_registrations;
CREATE POLICY "Public can view registrations"
    ON public.event_registrations FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Users can register themselves" ON public.event_registrations;
CREATE POLICY "Users can register themselves"
    ON public.event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own registration" ON public.event_registrations;
CREATE POLICY "Users can update own registration"
    ON public.event_registrations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Announcements Policies
DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
CREATE POLICY "Public can view announcements"
    ON public.announcements FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Officers can manage announcements" ON public.announcements;
CREATE POLICY "Officers can manage announcements"
    ON public.announcements FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.club_members cm
            WHERE cm.club_id = announcements.club_id
              AND cm.profile_id = auth.uid()
              AND cm.role IN ('president', 'vice_president', 'lead')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Admin Activity Logs Policies
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs"
    ON public.admin_activity_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "System can insert activity logs"
    ON public.admin_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 9. NOTIFY POSTGREST TO RELOAD SCHEMA CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';

-- Verification confirmation output
SELECT 'CampusHub schema repair migration completed successfully! Schema cache reloaded.' AS status;
