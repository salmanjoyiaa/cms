-- Storage buckets and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('assets', 'assets', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4', 'application/pdf']),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Assets bucket policies (private, workspace-scoped via path prefix)
CREATE POLICY "workspace_members_upload_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_select_assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_update_assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_delete_assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);

-- Blog images (public read, authenticated write)
CREATE POLICY "public_read_blog_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

CREATE POLICY "authenticated_upload_blog_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "authenticated_update_blog_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "authenticated_delete_blog_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
  )
);
