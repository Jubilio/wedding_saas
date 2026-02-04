-- TABLES AND SEATING CONFIGURATION
-- This script ensures the tables entity exists and is configured for automated linking.

-- 1. Create the tables definition
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, name)
);

-- 2. Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- 3. Public Select for Seating Chart
DROP POLICY IF EXISTS "Public Guest Select" ON public.tables;
CREATE POLICY "Public Guest Select" ON public.tables FOR SELECT USING (true);

-- 4. Admin Management
DROP POLICY IF EXISTS "Admin All" ON public.tables;
CREATE POLICY "Admin All" ON public.tables FOR ALL TO authenticated USING (true);

-- 5. Link RSVPs with invitations for automatic table mapping
-- Note: Already handled in Edge Function, but ensuring columns exist.
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS table_assignment TEXT;
