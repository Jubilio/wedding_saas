-- MULTI-TEMPLATE SYSTEM EXPANSION
-- This script adds the high-level template_id to theme configurations.

ALTER TABLE public.theme_configs 
ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'classic-gold';

-- Migration: Set default template for existing configurations
UPDATE public.theme_configs 
SET template_id = 'classic-gold'
WHERE template_id IS NULL;

-- Ensure the UI has something to work with for existing events
-- (In case theme_configs record is missing, but EventContext usually 
-- handles the logic. This ensures DB consistency).
INSERT INTO public.theme_configs (event_id, template_id)
SELECT id, 'classic-gold' FROM public.events
ON CONFLICT DO NOTHING;
