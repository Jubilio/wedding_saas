-- Migration to add even more customization fields
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS ceremony_time TEXT DEFAULT '10:00',
ADD COLUMN IF NOT EXISTS reception_time TEXT DEFAULT '14:00',
ADD COLUMN IF NOT EXISTS dress_code TEXT DEFAULT 'Passeio Completo / Formal',
ADD COLUMN IF NOT EXISTS reception_venue TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS story_json JSONB DEFAULT '[]'::jsonb;

-- Populate defaults for Binth & Jubilio
UPDATE public.events 
SET 
  ceremony_time = '10:00',
  reception_time = '14:00',
  dress_code = 'Passeio Completo / Formal',
  reception_venue = 'THAYANA Eventos',
  story_json = '[
    {"year": "2021", "title": "A Primeira Tentativa", "description": "Em 2021, Jubílio fez a sua primeira tentativa de aproximação...", "image": "beach_hold_hands"},
    {"year": "2022", "title": "O Recomeço", "description": "Após uma vigília, Jubílio voltou a falar com Binth...", "image": "beach_hug"},
    {"year": "2023", "title": "O Primeiro Encontro", "description": "Tiveram o primeiro encontro como namorados no D\'bambu...", "image": "beach_kiss"},
    {"year": "2024", "title": "Distância que Fortaleceu", "description": "A distância física entre Maputo e Pemba não enfraqueceu o que estavam construindo...", "image": "beach_smile"},
    {"year": "2025", "title": "Rumo ao Grande Dia", "description": "2025 trouxe as famílias mais próximas...", "image": "bride_bench"}
  ]'::jsonb
WHERE slug = 'binth-jubilio';
