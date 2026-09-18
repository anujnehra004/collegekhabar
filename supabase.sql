-- ==========================================================
-- CAMPUS CONNECT - SUPABASE DATABASE SCHEMA & SETUP
-- University Event Management Platform
-- ==========================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running script (in reverse dependency order)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================================
-- TABLE: profiles
-- ==========================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- TABLE: events
-- ==========================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL,
    registration_deadline DATE NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 100 CHECK (max_participants > 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- TABLE: registrations
-- ==========================================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
    CONSTRAINT unique_student_event UNIQUE (event_id, student_id)
);

-- ==========================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==========================================================
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_student_id ON registrations(student_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ==========================================================
-- TRIGGERS & FUNCTIONS
-- ==========================================================

-- 1. Function to update updated_at timestamp on events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. Function to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------
-- Anyone authenticated can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- Users can update their own display name
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their profile if trigger is bypassed
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------
-- EVENTS POLICIES
-- ----------------------------------------------------------
-- Public read access: Anyone (anon or authenticated) can view upcoming events
CREATE POLICY "Public read access for events"
ON events FOR SELECT
TO public
USING (true);

-- Admin write access: Only administrators can create events
CREATE POLICY "Admins can insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin update access: Only administrators can update events
CREATE POLICY "Admins can update events"
ON events FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin delete access: Only administrators can delete events
CREATE POLICY "Admins can delete events"
ON events FOR DELETE
TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------
-- REGISTRATIONS POLICIES
-- ----------------------------------------------------------
-- Students can view their own registrations; Admins can view all registrations
CREATE POLICY "View registrations"
ON registrations FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR public.is_admin());

-- Students can register themselves for events
CREATE POLICY "Students can insert own registration"
ON registrations FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Students can update their own registration (e.g. status='cancelled')
CREATE POLICY "Students can update own registration"
ON registrations FOR UPDATE
TO authenticated
USING (student_id = auth.uid() OR public.is_admin())
WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- Admins can delete registrations if needed
CREATE POLICY "Admins can delete registrations"
ON registrations FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==========================================================
-- SAMPLE EVENTS SEED DATA
-- ==========================================================

INSERT INTO events (title, category, description, date, time, venue, organizer, registration_deadline, max_participants, image_url)
VALUES
(
    'TechFest 2026',
    'Technology',
    'An annual technology festival featuring coding competitions, project exhibitions, technical talks and innovation challenges.',
    '2026-10-10',
    '10:00 AM - 5:00 PM',
    'Main Auditorium',
    'Computer Science Club',
    '2026-10-07',
    250,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
),
(
    'CodeSprint Hackathon',
    'Hackathon',
    'A 12-hour coding hackathon where students build innovative solutions to real-world problems.',
    '2026-10-18',
    '9:00 AM - 8:00 PM',
    'Innovation Lab',
    'Coding Club',
    '2026-10-15',
    100,
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
),
(
    'Campus Cultural Night',
    'Cultural',
    'An evening of music, dance, performances and student talent.',
    '2026-10-24',
    '6:00 PM - 10:00 PM',
    'Open Air Theatre',
    'Cultural Society',
    '2026-10-22',
    500,
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
),
(
    'AI & Future Technology Seminar',
    'Seminar',
    'An interactive seminar discussing artificial intelligence, emerging technologies and the future of computing.',
    '2026-11-02',
    '11:00 AM - 1:00 PM',
    'Seminar Hall',
    'AI Society',
    '2026-10-31',
    200,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
),
(
    'Inter-College Cricket Tournament',
    'Sports',
    'An inter-college cricket tournament bringing together university teams for a competitive sporting event.',
    '2026-11-08',
    '8:00 AM - 4:00 PM',
    'University Sports Ground',
    'Sports Committee',
    '2026-11-04',
    160,
    'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80'
),
(
    'Startup Pitch Challenge',
    'Competition',
    'Students pitch innovative startup ideas to a panel of mentors and industry professionals.',
    '2026-11-15',
    '10:00 AM - 3:00 PM',
    'Innovation Center',
    'Entrepreneurship Cell',
    '2026-11-12',
    80,
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
);

-- ==========================================================
-- DEMO ACCOUNTS SETUP INSTRUCTIONS
-- ==========================================================
/*
To create the demo accounts in Supabase:
1. In Supabase Dashboard, navigate to Authentication -> Users.
2. Click "Add User" -> "Create User".
3. Create the Student user:
   - Email: student@university.edu
   - Password: student123
   - Auto Confirm User: ON
   - User Metadata (optional): {"name": "Alex Johnson", "role": "student"}

4. Create the Admin user:
   - Email: admin@campusconnect.edu
   - Password: Admin@123
   - Auto Confirm User: ON
   - User Metadata: {"name": "Campus Administrator", "role": "admin"}

5. If you already created the admin user, promote them to admin role in SQL:
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@campusconnect.edu';
*/
