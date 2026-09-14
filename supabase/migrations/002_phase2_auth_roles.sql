-- ====================================================================
-- CampusHub Phase 2 Database Migration (Authentication, Roles & Membership)
-- File: supabase/migrations/002_phase2_auth_roles.sql
-- ====================================================================

-- 1. UPDATE USER_ROLE ENUM
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'club_member';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. EXTEND PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Connect profiles to auth.users if compatible
DO $$ BEGIN
    ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_auth_users
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
    NOT VALID;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;

-- 3. PROFILE ROLE SECURITY TRIGGER
-- Prevents non-admin users from escalating their own role
CREATE OR REPLACE FUNCTION check_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Only admins can change a profile's role
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            NEW.role := OLD.role;
        END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_profile_role_update ON profiles;
CREATE TRIGGER trg_check_profile_role_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION check_profile_role_update();

-- 4. AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_role user_role := 'student';
    meta_role text;
BEGIN
    meta_role := NEW.raw_user_meta_data->>'role';
    IF meta_role IN ('student', 'club_lead', 'faculty_coordinator', 'admin') THEN
        initial_role := meta_role::user_role;
    ELSIF meta_role = 'faculty' THEN
        initial_role := 'faculty_coordinator'::user_role;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        initial_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. MEMBERSHIP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS membership_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate pending requests for the same user and club
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_membership_request 
ON membership_requests (club_id, user_id) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_membership_requests_club_id ON membership_requests(club_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id ON membership_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON membership_requests(status);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read profiles" ON profiles;
    CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    CREATE POLICY "Users can insert own profile" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN others THEN null;
END $$;

-- Membership Requests Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can create membership request" ON membership_requests;
    CREATE POLICY "Users can create membership request" ON membership_requests 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own requests" ON membership_requests;
    CREATE POLICY "Users can view own requests" ON membership_requests 
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can cancel own pending requests" ON membership_requests;
    CREATE POLICY "Users can cancel own pending requests" ON membership_requests 
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (status = 'cancelled');
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Club leads and admins can view club requests" ON membership_requests;
    CREATE POLICY "Club leads and admins can view club requests" ON membership_requests 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = membership_requests.club_id
              AND club_members.profile_id = auth.uid()
              AND club_members.role IN ('president', 'vice_president', 'secretary')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'faculty_coordinator')
        )
    );
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Club leads and admins can review club requests" ON membership_requests;
    CREATE POLICY "Club leads and admins can review club requests" ON membership_requests 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = membership_requests.club_id
              AND club_members.profile_id = auth.uid()
              AND club_members.role IN ('president', 'vice_president', 'secretary')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'faculty_coordinator')
        )
    );
EXCEPTION WHEN others THEN null;
END $$;

-- Notifications Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    CREATE POLICY "Users can view own notifications" ON notifications 
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    CREATE POLICY "Users can update own notifications" ON notifications 
    FOR UPDATE USING (profile_id = auth.uid());
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
    CREATE POLICY "Authenticated users can create notifications" ON notifications 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN others THEN null;
END $$;
