-- 1. Create 'invites' table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  label TEXT, -- Used for Table Name/Group Display
  event TEXT DEFAULT 'Casamento Binth & Jubilio',
  max_guests INTEGER NOT NULL DEFAULT 1,
  allow_plus_one BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create 'guests' table (Legacy/Reference)
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'principal', -- 'principal' or 'companion'
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'responded'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create 'rsvps' table (Robust)
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE UNIQUE,
  guest_name TEXT NOT NULL,
  attending BOOLEAN NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1 CHECK (guests_count >= 0),
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Trigger to validate max_guests
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

-- 5. Enable RLS on all tables
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Allow public (anon) read-only access to specific endpoints via Functions, but here we secure tables directly.
-- For Admin Dashboard (Authenticated Users):
CREATE POLICY "Enable all access for authenticated users" ON public.invites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.guests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.rsvps FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Allow public (anon) to read messages
CREATE POLICY "Allow public read of messages" ON public.rsvps FOR SELECT TO anon USING (true);

-- Allow public inserts/updates ONLY via Edge Functions (Service Role) which bypass RLS.
-- However, if we want public to view invites via token, we might need a specific policy, 
-- BUT our architecture uses get-invite Edge Function which uses Service Role (bypassing RLS).
-- So "No public access" logic usually works if frontend ONLY uses Functions.
-- BUT if you have any public read logic directly from client, you need:
-- CREATE POLICY "Allow public read by token" ON public.invites FOR SELECT USING (true); -- BE CAREFUL

-- We keep "No public access" as a baseline, but the above Authenticated policies will override it for admins.

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_guests_invite_id ON public.guests(invite_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invite_id ON public.rsvps(invite_id);

-- 8. Create 'tables' (Mesas) for seating management
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tables
CREATE POLICY "Enable all access for authenticated users" ON public.tables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read" ON public.tables FOR SELECT TO anon USING (true);

-- 9. Add table_assignment column to rsvps (if not exists)
-- NOTE: Run this manually if table already exists:
-- ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS table_assignment TEXT;

-- 10. Create 'public_messages' table for the wall
CREATE TABLE IF NOT EXISTS public.public_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.public_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read" ON public.public_messages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert" ON public.public_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.public_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
