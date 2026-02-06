-- NARRATIVE DEEP CUSTOMIZATION
-- This script adds dedicated fields for the "Nossa História" introduction and unique page cover.

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS story_intro TEXT,
ADD COLUMN IF NOT EXISTS story_cover_url TEXT;

-- Migration: Set defaults for existing binth-jubilio event for consistency
UPDATE public.events 
SET 
  story_intro = 'Esta história começa no desejo de Jubílio, no desenho silencioso da mulher que ele sonhava ter ao seu lado, e em Deus, que com toda a Sua graça, confirmou esse sonho.',
  story_cover_url = hero_image_url -- Use existing hero as initial default cover
WHERE slug = 'binth-jubilio' AND story_intro IS NULL;
