-- DEFINITIVE SAAS CUSTOMIZATION MIGRATION (FINAL)
-- This script adds all fields required for white-labeling, narratives, and gallery management.

ALTER TABLE public.events 
-- Basic Display Info
ADD COLUMN IF NOT EXISTS bride_name TEXT,
ADD COLUMN IF NOT EXISTS groom_name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,

-- Parental Details (JSONB for flexibility)
ADD COLUMN IF NOT EXISTS bride_parents JSONB DEFAULT '{"father": "", "mother": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS groom_parents JSONB DEFAULT '{"father": "", "mother": ""}'::jsonb,

-- Venue & Ceremony Details
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_address TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS ceremony_time TEXT DEFAULT '10:00',
ADD COLUMN IF NOT EXISTS reception_time TEXT DEFAULT '14:00',
ADD COLUMN IF NOT EXISTS reception_venue TEXT,
ADD COLUMN IF NOT EXISTS dress_code TEXT DEFAULT 'Passeio Completo / Formal',

-- Financial & Contribution Details
ADD COLUMN IF NOT EXISTS pix_key TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_nib TEXT,
ADD COLUMN IF NOT EXISTS mobile_money_number TEXT,

-- Content & Media
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS story_json JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_json JSONB DEFAULT '[]'::jsonb;

-- Populate Binth & Jubilio defaults for consistency
-- Note: PostgreSQL single quotes are escaped with another single quote ('')
-- Ensure the default event exists (UPSERT)
INSERT INTO public.events (slug, title, bride_name, groom_name, venue_name, venue_address, google_maps_url, bank_name, bank_nib, mobile_money_number, pix_key, story_json, gallery_json)
VALUES (
  'binth-jubilio',
  'Binth & Jubílio',
  'Binth',
  'Jubílio',
  'MEA Congregação de Mateque',
  'THAYANA Eventos',
  'https://www.google.com/maps/search/?api=1&query=MEA+Congregação+de+Mateque',
  'Millennium BIM',
  '000100000040665901857',
  '84 577 9565',
  'jubilio.pix@email.com',
  '[
    {"year": "2021", "title": "A Primeira Tentativa", "description": "Em 2021, Jubílio fez a sua primeira tentativa de aproximação, usando como pretexto uma camisola emprestada. Uma estratégia tímida... Mas Deus já tinha o tempo certo preparado.", "image": "beach_hold_hands"},
    {"year": "2022", "title": "O Recomeço", "description": "Após uma vigília, Jubílio voltou a falar com Binth. Jubílio revelou seu coração, e em dezembro de 2022, Binth sentiu que estava pronta para dizer ''sim''.", "image": "beach_hug"},
    {"year": "2023", "title": "O Primeiro Encontro", "description": "Tiveram o primeiro encontro como namorados no D''bambu — o lugar favorito de Jubílio, que se tornou ainda mais especial desde aquele dia.", "image": "beach_kiss"},
    {"year": "2024", "title": "Distância que Fortaleceu", "description": "A distância física entre Maputo e Pemba não enfraqueceu o que estavam construindo. Em 5 de dezembro, selaram o propósito de casar com o anel de compromisso.", "image": "beach_smile"},
    {"year": "2025", "title": "Rumo ao Grande Dia", "description": "2025 trouxe as famílias mais próximas, o pedido formal e a confirmação de que Deus estava — e sempre esteve — no centro de tudo.", "image": "bride_bench"}
  ]'::jsonb,
  '[
    {"src": "/src/assets/beach_smile.jpg", "alt": "Nós (Praia)", "span": "md:col-span-2 md:row-span-2"},
    {"src": "/src/assets/beach_kiss.jpg", "alt": "O Beijo", "span": "md:col-span-1 md:row-span-1"},
    {"src": "/src/assets/beach_hold_hands.jpg", "alt": "Juntos", "span": "md:col-span-1 md:row-span-1"},
    {"src": "/src/assets/beach_hug.jpg", "alt": "Abraço", "span": "md:col-span-1 md:row-span-2"},
    {"src": "/src/assets/groom_bench.jpg", "alt": "O Noivo", "span": "md:col-span-1 md:row-span-1"},
    {"src": "/src/assets/bride_bench.jpg", "alt": "A Noiva", "span": "md:col-span-1 md:row-span-1"}
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  bride_name = EXCLUDED.bride_name,
  groom_name = EXCLUDED.groom_name,
  venue_name = EXCLUDED.venue_name,
  venue_address = EXCLUDED.venue_address,
  google_maps_url = EXCLUDED.google_maps_url,
  bank_name = EXCLUDED.bank_name,
  bank_nib = EXCLUDED.bank_nib,
  mobile_money_number = EXCLUDED.mobile_money_number,
  pix_key = EXCLUDED.pix_key,
  story_json = EXCLUDED.story_json,
  gallery_json = EXCLUDED.gallery_json;

-- Ensure public access to events
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access" ON public.events FOR SELECT USING (true);
    END IF;
END $$;

-- Ensure RSVPs have table_assignment and standard fields
ALTER TABLE public.rsvps
ADD COLUMN IF NOT EXISTS table_assignment TEXT,
ADD COLUMN IF NOT EXISTS guests_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- Ensure Invites have standard fields used in dashboard
ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS label TEXT,
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS allow_plus_one BOOLEAN DEFAULT FALSE;

-- Ensure Guests have required management fields
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id),
ADD COLUMN IF NOT EXISTS invite_id UUID REFERENCES public.invites(id),
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'principal';

-- Ensure Public Messages exist for the mural
CREATE TABLE IF NOT EXISTS public.public_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id),
    name TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add event_id if column missing (in case table already existed from before)
ALTER TABLE public.public_messages ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id);

-- COMPLETE PUBLIC ACCESS REPAIR (SaaS Guest Visibility)
-- Ensure all tables have public SELECT access so the site doesn't 403 for guests.

DO $$ 
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN SELECT UNNEST(ARRAY['events', 'theme_configs', 'quiz_questions', 'invites', 'guests', 'rsvps', 'public_messages']) LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
        
        -- Recreate Public Select Policy (Safe Update)
        EXECUTE format('DROP POLICY IF EXISTS "Public Guest Select" ON public.%I', tbl_name);
        EXECUTE format('CREATE POLICY "Public Guest Select" ON public.%I FOR SELECT USING (true)', tbl_name);
    END LOOP;
END $$;

-- Enable Public Submissions (RSVP and Mural) - Recreate Safely
DROP POLICY IF EXISTS "Public Guest RSVP" ON public.rsvps;
CREATE POLICY "Public Guest RSVP" ON public.rsvps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Guest Mural" ON public.public_messages;
CREATE POLICY "Public Guest Mural" ON public.public_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Guest GuestInsert" ON public.guests;
CREATE POLICY "Public Guest GuestInsert" ON public.guests FOR INSERT WITH CHECK (true);
