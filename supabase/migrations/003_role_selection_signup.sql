-- File: supabase/migrations/003_role_selection_signup.sql
-- Description: Allow role selection on user signup via auth metadata

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
