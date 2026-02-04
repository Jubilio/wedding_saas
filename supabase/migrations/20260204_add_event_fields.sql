-- Migration to add missing columns to events and fix theme_configs structure
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Verify theme_configs structure matches OwnerDashboard expectations
-- The table already has colors (JSONB) and fonts (JSONB), which is better than individual columns.
-- We just need to update the insertion logic in OwnerDashboard.jsx.
