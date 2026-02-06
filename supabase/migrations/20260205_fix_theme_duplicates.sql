-- CLEANUP DUPLICATE THEME CONFIGURATIONS
-- This script removes duplicate theme_configs for the same event_id,
-- keeping only the most recently created record, and then adds a UNIQUE constraint.

-- 1. Identify and delete duplicates (keeping the latest)
DELETE FROM public.theme_configs a
USING public.theme_configs b
WHERE a.id < b.id  -- Keep the one with the higher ID (assuming sequential or just picking one)
  AND a.event_id = b.event_id;

-- Alternatively, more robust approach using created_at:
/*
DELETE FROM public.theme_configs
WHERE id NOT IN (
  SELECT DISTINCT ON (event_id) id
  FROM public.theme_configs
  ORDER BY event_id, created_at DESC
);
*/

-- 2. Add the unique constraint to prevent future duplicates
ALTER TABLE public.theme_configs
ADD CONSTRAINT theme_configs_single_per_event UNIQUE (event_id);

-- 3. Verify the state for the main event
-- (Optional cleanup if some rows were missing template_id during previous buggy inserts)
UPDATE public.theme_configs 
SET template_id = 'classic-gold' 
WHERE template_id IS NULL;
