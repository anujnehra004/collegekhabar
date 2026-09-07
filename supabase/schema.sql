-- =========================================================
-- CAMPUS CONNECT - PRODUCTION POSTGRESQL SCHEMA FOR SUPABASE
-- =========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    university TEXT DEFAULT 'State Technological University',
    department TEXT DEFAULT 'Computer Science & Engineering',
    year TEXT DEFAULT '3rd Year',
    bio TEXT DEFAULT 'Student passionate about technology, design, and campus innovation.',
    profile_image TEXT,
    banner_image TEXT,
    skills TEXT[] DEFAULT ARRAY['JavaScript', 'React', 'Problem Solving']::TEXT[],
    interests TEXT[] DEFAULT ARRAY['Hackathons', 'AI & ML', 'Web Development']::TEXT[],
    is_organizer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMUNITIES TABLE (Clubs & Societies)
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Technology',
    logo TEXT,
    cover_image TEXT,
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNITY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'lead')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (community_id, user_id)
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'Hackathon', 'Workshop', 'Seminar', 'Cultural', 
            'Sports', 'Technical', 'Competition', 'Club Activity', 
            'Placement', 'Fest', 'Social', 'Other'
        )
    ),
    banner_image TEXT,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'offline' CHECK (event_type IN ('offline', 'online', 'hybrid')),
    registration_deadline TIMESTAMPTZ,
    max_participants INTEGER DEFAULT 150,
    current_participants INTEGER DEFAULT 0,
    eligibility TEXT DEFAULT 'Open to all university students',
    rules TEXT,
    contact_email TEXT,
    is_free BOOLEAN DEFAULT TRUE,
    price NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    schedule JSONB DEFAULT '[]'::JSONB,
    speakers JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
    ticket_code TEXT NOT NULL,
    UNIQUE (event_id, user_id)
);

-- 6. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- 7. CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (sender_id, receiver_id)
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN (
            'connection_request', 'connection_accepted', 
            'registration_confirmed', 'event_reminder', 
            'community_event', 'event_update', 'event_cancelled'
        )
    ),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_community_id ON public.events(community_id);

CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_users ON public.connections(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- =========================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- =========================================================

-- Trigger to update current_participants on registrations change
CREATE OR REPLACE FUNCTION public.sync_event_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') THEN
        UPDATE public.events 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'confirmed') THEN
        UPDATE public.events 
        SET current_participants = GREATEST(0, current_participants - 1) 
        WHERE id = OLD.event_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'confirmed' AND NEW.status <> 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = GREATEST(0, current_participants - 1) 
            WHERE id = NEW.event_id;
        ELSIF (OLD.status <> 'confirmed' AND NEW.status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_event_participants ON public.registrations;
CREATE TRIGGER trigger_sync_event_participants
AFTER INSERT OR UPDATE OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.sync_event_participants();

-- Trigger to update member_count on community_members change
CREATE OR REPLACE FUNCTION public.sync_community_members()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.communities 
        SET member_count = GREATEST(0, member_count - 1) 
        WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_community_members ON public.community_members;
CREATE TRIGGER trigger_sync_community_members
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.sync_community_members();

-- Trigger to automatically create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        university, 
        department, 
        year, 
        interests,
        profile_image
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'university', 'State Technological University'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
        COALESCE(NEW.raw_user_meta_data->>'year', '3rd Year'),
        COALESCE((NEW.raw_user_meta_data->>'interests')::TEXT[], ARRAY['Hackathons', 'AI & ML']::TEXT[]),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Communities: Public read, authenticated create/update
CREATE POLICY "Communities are viewable by everyone" ON public.communities
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Community creators can update their communities" ON public.communities
    FOR UPDATE USING (auth.uid() = created_by);

-- Community Members: Public read, self join/leave
CREATE POLICY "Community members are viewable by everyone" ON public.community_members
    FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members
    FOR DELETE USING (auth.uid() = user_id);

-- Events: Public read published events, organizers full access
CREATE POLICY "Published events are viewable by everyone" ON public.events
    FOR SELECT USING (status = 'published' OR auth.uid() = organizer_id);
CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Organizers can update their events" ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their events" ON public.events
    FOR DELETE USING (auth.uid() = organizer_id);

-- Registrations: Self read/manage, Organizers can view attendees
CREATE POLICY "Users can view own registrations" ON public.registrations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view event registrations" ON public.registrations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.events WHERE events.id = registrations.event_id AND events.organizer_id = auth.uid()
    ));
CREATE POLICY "Users can register for events" ON public.registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own registration" ON public.registrations
    FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: Self read/manage
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Connections: Involved parties read/manage
CREATE POLICY "Users can view their own connections" ON public.connections
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send connection requests" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update connection status" ON public.connections
    FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
CREATE POLICY "Users can remove connections" ON public.connections
    FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Notifications: Self read/manage
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System/Authenticated can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =========================================================
-- STORAGE BUCKETS SETUP
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public read for event banners" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-banners');
CREATE POLICY "Authenticated upload for event banners" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'event-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for profile avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-avatars');
CREATE POLICY "Authenticated upload for profile avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');
