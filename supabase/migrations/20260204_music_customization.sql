-- DYNAMIC BACKGROUND MUSIC CUSTOMIZATION
-- This script adds a field to store the URL of the wedding's custom soundtrack.

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS music_url TEXT;

-- Migration: Set default for existing binth-jubilio event
UPDATE public.events 
SET music_url = '/music/someday.mp3'
WHERE slug = 'binth-jubilio' AND music_url IS NULL;
