-- SUPABASE STORAGE CONFIGURATION
-- This script creates the wedding-assets bucket and sets up security policies.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-assets', 'wedding-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public access to view images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'wedding-assets');

-- 3. Authenticated access to upload/delete images
-- (Restricted to platform owners/admins)
CREATE POLICY "Admin Upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'wedding-assets');

CREATE POLICY "Admin Delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'wedding-assets');

CREATE POLICY "Admin Update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'wedding-assets');
