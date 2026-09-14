-- ====================================================================
-- CampusHub Phase 3 Database Migration (Core Club & Event Functionality)
-- File: supabase/migrations/004_phase3_core_features.sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENSURE MEMBERSHIP REQUESTS TABLE EXISTS WITH REJECTION REASON
CREATE TABLE IF NOT EXISTS membership_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_membership_request 
ON membership_requests (club_id, user_id) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_membership_requests_club_id ON membership_requests(club_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id ON membership_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON membership_requests(status);

-- 3. EXTEND CLUBS TABLE WITH STATUS & REJECTION REASON
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

DO $$ BEGIN
    ALTER TABLE clubs ADD CONSTRAINT chk_clubs_status 
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'suspended'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);

-- 4. EXTEND EVENTS TABLE WITH REJECTION REASON & REVIEW DETAILS
ALTER TABLE events ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 5. CREATE EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT unique_event_user_registration UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- 6. CREATE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_club_id ON announcements(club_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- 7. CREATE ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 8A. Event Registrations Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own event registrations" ON event_registrations;
    CREATE POLICY "Users can view own event registrations" ON event_registrations 
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Club leads and admins can view event attendees" ON event_registrations;
    CREATE POLICY "Club leads and admins can view event attendees" ON event_registrations 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN club_members ON club_members.club_id = events.club_id
            WHERE events.id = event_registrations.event_id
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
    DROP POLICY IF EXISTS "Users can register themselves for events" ON event_registrations;
    CREATE POLICY "Users can register themselves for events" ON event_registrations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can cancel their own registrations" ON event_registrations;
    CREATE POLICY "Users can cancel their own registrations" ON event_registrations 
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN null;
END $$;

-- 8B. Announcements Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read announcements" ON announcements;
    CREATE POLICY "Public read announcements" ON announcements 
    FOR SELECT USING (true);
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Club leads can manage club announcements" ON announcements;
    CREATE POLICY "Club leads can manage club announcements" ON announcements 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM club_members
            WHERE club_members.club_id = announcements.club_id
              AND club_members.profile_id = auth.uid()
              AND club_members.role IN ('president', 'vice_president', 'secretary')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
EXCEPTION WHEN others THEN null;
END $$;

-- 8C. Admin Activity Logs Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
    CREATE POLICY "Admins can view activity logs" ON admin_activity_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON admin_activity_logs;
    CREATE POLICY "Authenticated users can insert activity logs" ON admin_activity_logs 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN others THEN null;
END $$;
