-- CONSOLIDATED SCHEMA CUSTOMIZATION (STORY & CONTACTS)
-- Run this script to ensure all new dynamic fields exist in your database.

BEGIN;

-- 1. Expansion: Nossa História
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS story_intro TEXT,
ADD COLUMN IF NOT EXISTS story_cover_url TEXT;

-- 2. Expansion: Canais de Contato
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS contact_phones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_location TEXT;

-- 3. Defaults for Binth & Jubílio (Backward Compatibility)
UPDATE public.events 
SET 
  story_intro = COALESCE(story_intro, 'Esta história começa no desejo de Jubílio, no desenho silencioso da mulher que ele sonhava ter ao seu lado, e em Deus, que com toda a Sua graça, confirmou esse sonho.'),
  story_cover_url = COALESCE(story_cover_url, hero_image_url),
  contact_phones = COALESCE(contact_phones, '["+258 84 538 5814", "+258 84 577 9565", "+258 84 389 7869"]'::jsonb),
  contact_email = COALESCE(contact_email, 'jubiliomausse5@gmail.com'),
  contact_location = COALESCE(contact_location, 'Matola, Maputo, Moçambique')
WHERE slug = 'binth-jubilio';

COMMIT;
