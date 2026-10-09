INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ai-receipts', 'ai-receipts', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "ai_receipts_owner_insert" ON storage.objects;
CREATE POLICY "ai_receipts_owner_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ai-receipts' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));
DROP POLICY IF EXISTS "ai_receipts_owner_select" ON storage.objects;
CREATE POLICY "ai_receipts_owner_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ai-receipts' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));
DROP POLICY IF EXISTS "ai_receipts_owner_delete" ON storage.objects;
CREATE POLICY "ai_receipts_owner_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ai-receipts' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "ai_receipts_private_owner" ON storage.objects;
CREATE POLICY "ai_receipts_private_owner" ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
USING (bucket_id <> 'ai-receipts' OR (storage.foldername(name))[1] = (SELECT auth.uid()::text))
WITH CHECK (bucket_id <> 'ai-receipts' OR (storage.foldername(name))[1] = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "ai_receipts_no_anonymous" ON storage.objects;
CREATE POLICY "ai_receipts_no_anonymous" ON storage.objects AS RESTRICTIVE FOR ALL TO anon
USING (bucket_id <> 'ai-receipts') WITH CHECK (bucket_id <> 'ai-receipts');
