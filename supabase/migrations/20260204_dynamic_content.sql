-- Migration to add customization fields to events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS groom_name TEXT,
ADD COLUMN IF NOT EXISTS bride_name TEXT,
ADD COLUMN IF NOT EXISTS groom_parents JSONB DEFAULT '{"father": "", "mother": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS bride_parents JSONB DEFAULT '{"father": "", "mother": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_address TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- Migrate existing Binth & Jubílio data
UPDATE public.events 
SET 
  groom_name = 'Jubílio',
  bride_name = 'Binth',
  groom_parents = '{"father": "Filiano J. Maússe", "mother": "Cezartina S. Sitoe"}'::jsonb,
  bride_parents = '{"father": "Mário H. Buque", "mother": "Ana V. Ngovene"}'::jsonb,
  venue_name = 'Local a Definir',
  pix_key = 'jubilio.pix@email.com'
WHERE slug = 'binth-jubilio';
