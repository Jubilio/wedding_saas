-- 1. Create 'events' table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create 'theme_configs' table
CREATE TABLE IF NOT EXISTS public.theme_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  colors JSONB, -- { primary, secondary, text, background, etc. }
  fonts JSONB, -- { heading, body }
  music_url TEXT,
  logo_url TEXT,
  wedding_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create 'quiz_questions' table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create 'invites' table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  label TEXT, -- Used for Table Name/Group Display
  max_guests INTEGER NOT NULL DEFAULT 1,
  allow_plus_one BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, token)
);

-- 5. Create 'guests' table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'principal', -- 'principal' or 'companion'
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'responded'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create 'rsvps' table
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  attending BOOLEAN NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1 CHECK (guests_count >= 0),
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, invite_id)
);

-- 7. Create 'tables' table
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, name)
);

-- 8. Create 'public_messages' table
CREATE TABLE IF NOT EXISTS public.public_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Trigger to validate max_guests
CREATE OR REPLACE FUNCTION check_max_guests()
RETURNS TRIGGER AS $$
DECLARE
  v_max_guests INTEGER;
BEGIN
  SELECT max_guests INTO v_max_guests FROM public.invites WHERE id = NEW.invite_id;
  
  IF NEW.guests_count > v_max_guests THEN
    RAISE EXCEPTION 'O número de convidados (%) excede o limite permitido (%) para este convite.', NEW.guests_count, v_max_guests;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_guests
BEFORE INSERT OR UPDATE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION check_max_guests();

-- 10. Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_messages ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies

-- Event visibility: Anyone can read an event by its slug (public)
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

-- Event Management: Owners can manage their events
CREATE POLICY "Owners manage events" ON public.events FOR ALL USING (auth.uid() = owner_id);

-- Theme & Quiz: Public read based on event visibility
CREATE POLICY "Public read themes" ON public.theme_configs FOR SELECT USING (true);
CREATE POLICY "Owners manage themes" ON public.theme_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);

CREATE POLICY "Public read quiz" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Owners manage quiz" ON public.quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);

-- Data isolation by event_id for other tables
-- For Admin Dashboard (Authenticated Owners):
CREATE POLICY "Owners manage invites" ON public.invites FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners manage guests" ON public.guests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners manage rsvps" ON public.rsvps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners manage tables" ON public.tables FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners manage messages" ON public.public_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND owner_id = auth.uid())
);

-- Public Guest Access:
-- Allow public SELECT/INSERT for specific guest tables
CREATE POLICY "Public read messages" ON public.public_messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON public.public_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read rsvps" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "Public insert/update rsvps" ON public.rsvps FOR INSERT WITH CHECK (true); -- Usually handled via Edge Functions

-- 12. Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_invites_event_token ON public.invites(event_id, token);
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON public.rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_messages_event ON public.public_messages(event_id);
