-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  true,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Enable RLS on the storage.objects table for this bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs');

CREATE POLICY IF NOT EXISTS "Allow public read access to CVs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');

CREATE POLICY IF NOT EXISTS "Allow users to delete their own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
