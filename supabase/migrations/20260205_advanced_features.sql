-- INTERACTIVE MURAL & DYNAMIC GIVING
-- 1. Mural Image Support
ALTER TABLE public.public_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. Dynamic Gift List
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS gift_list_json JSONB DEFAULT '[]'::jsonb;

-- Populate Binth & Jubilio defaults for Gift List
UPDATE public.events 
SET gift_list_json = '[
  {
    "title": "Casa das Loiças",
    "icon": "🍽️",
    "description": "Sugestões de itens para equipar a nossa cozinha e mesa.",
    "items": [
      {"name": "Tostadeira", "icon": "🥪"},
      {"name": "Torreadeira", "icon": "🍞"},
      {"name": "Air-fryer", "icon": "🍟"},
      {"name": "Chaleira elétrica", "icon": "🫖"},
      {"name": "Dispensador de cereais", "icon": "🥣"},
      {"name": "Panelas com tampa de vidro", "icon": "🥘"},
      {"name": "Jogo de talheres", "icon": "🍴"},
      {"name": "Pratos de porcelana", "icon": "🍽️"},
      {"name": "Taças de vidro", "icon": "🥂"},
      {"name": "Chávenas", "icon": "☕"},
      {"name": "Varinha mágica", "icon": "🪄"},
      {"name": "Boleiro", "icon": "🍰"}
    ]
  },
  {
    "title": "Loja da Hisense",
    "icon": "📺",
    "description": "Complementos e aparelhos eletrónicos para o nosso lar.",
    "items": [
      {"name": "Geleira", "icon": "❄️"},
      {"name": "Geladeira", "icon": "🍦"},
      {"name": "Micro-ondas", "icon": "⏲️"},
      {"name": "TV", "icon": "📺"},
      {"name": "AC", "icon": "🌬️"}
    ]
  },
  {
    "title": "Experiências & Memórias",
    "icon": "✈️",
    "description": "Presentes que se transformam em momentos inesquecíveis.",
    "items": [
      {"name": "Contribuição para Lua-de-mel", "icon": "🏝️"},
      {"name": "Jantar Romântico", "icon": "🍷"},
      {"name": "Sessão Fotográfica", "icon": "📸"},
      {"name": "Fundo ''Primeiros Dias''", "icon": "💝"}
    ]
  }
]'::jsonb
WHERE slug = 'binth-jubilio';
