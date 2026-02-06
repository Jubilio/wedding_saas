-- CONTACT INFORMATION CUSTOMIZATION
-- This script adds fields to store event contact details (phones, email, location).

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS contact_phones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_location TEXT;

-- Migration: Set defaults for existing binth-jubilio event for consistency
UPDATE public.events 
SET 
  contact_phones = '["+258 84 538 5814", "+258 84 577 9565", "+258 84 389 7869"]'::jsonb,
  contact_email = 'jubiliomausse5@gmail.com',
  contact_location = 'Matola, Maputo, Moçambique'
WHERE slug = 'binth-jubilio' AND contact_email IS NULL;
