-- Enable public access to the 'wedding-photos' bucket
-- This script sets up policies to allow public (anon) uploads and reads for tickets.

-- 1. Create the bucket if it doesn't exist (optional, usually exists)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('wedding-photos', 'wedding-photos', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow Public Upload (Specifically to the tickets/ folder)
CREATE POLICY "Allow public upload of tickets"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'wedding-photos' AND 
  (storage.foldername(name))[1] = 'tickets'
);

-- 3. Allow Public Update (To allow overwriting/upserting)
CREATE POLICY "Allow public update of tickets"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'wedding-photos' AND 
  (storage.foldername(name))[1] = 'tickets'
)
WITH CHECK (
  bucket_id = 'wedding-photos' AND 
  (storage.foldername(name))[1] = 'tickets'
);

-- 4. Allow Public Read (To view the sharing invitation)
CREATE POLICY "Allow public read of wedding photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wedding-photos');
