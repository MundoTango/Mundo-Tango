-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - STORAGE BUCKET RLS POLICIES
-- Row Level Security Policies for Supabase Storage
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script defines comprehensive RLS policies for Supabase Storage buckets.
-- Policies ensure users can only upload/manage their own files while maintaining
-- appropriate read access for public content.
--
-- Buckets:
-- - avatars: User profile pictures (user-owned, public read)
-- - posts: Post images/videos (user-owned, public read)
-- - events: Event images (creator-owned, public read)
--
-- Usage: Execute this script in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS SETUP
-- ═══════════════════════════════════════════════════════════════

-- Note: These buckets should be created via Supabase Dashboard or API
-- This script only creates RLS policies, not the buckets themselves
--
-- Required buckets:
-- 1. avatars (public: true, file_size_limit: 2MB, allowed_mime_types: ['image/*'])
-- 2. posts (public: true, file_size_limit: 10MB, allowed_mime_types: ['image/*', 'video/*'])
-- 3. events (public: true, file_size_limit: 5MB, allowed_mime_types: ['image/*'])

-- ═══════════════════════════════════════════════════════════════
-- AVATARS BUCKET POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing avatar policies if they exist
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- INSERT Policy: Users can upload their own avatar
-- File must be in /avatars/{user_id}/ folder
CREATE POLICY "Avatar upload policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE Policy: Users can update their own avatar
-- File must be in /avatars/{user_id}/ folder
CREATE POLICY "Avatar update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE Policy: Users can delete their own avatar
-- File must be in /avatars/{user_id}/ folder
CREATE POLICY "Avatar delete policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT Policy: Public read access for avatars
-- Anyone can view avatar images (needed for public profiles)
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ═══════════════════════════════════════════════════════════════
-- POSTS BUCKET POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Drop existing post policies if they exist
DROP POLICY IF EXISTS "Post upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Post update policy" ON storage.objects;
DROP POLICY IF EXISTS "Post delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Public post media access" ON storage.objects;

-- INSERT Policy: Authenticated users can upload post media
-- File must be in /posts/{user_id}/ folder
CREATE POLICY "Post upload policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE Policy: Users can update their own post media
-- File must be in /posts/{user_id}/ folder
CREATE POLICY "Post update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE Policy: Users can delete their own post media
-- File must be in /posts/{user_id}/ folder
CREATE POLICY "Post delete policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT Policy: Public read access for post media
-- Anyone can view post images/videos (social platform design)
CREATE POLICY "Public post media access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- ═══════════════════════════════════════════════════════════════
-- EVENTS BUCKET POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Drop existing event policies if they exist
DROP POLICY IF EXISTS "Event upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Event update policy" ON storage.objects;
DROP POLICY IF EXISTS "Event delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Public event media access" ON storage.objects;

-- INSERT Policy: Authenticated users can upload event images
-- File must be in /events/{user_id}/ folder
-- Note: user_id is the event creator, validated at application level
CREATE POLICY "Event upload policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE Policy: Event creators can update event images
-- File must be in /events/{user_id}/ folder
CREATE POLICY "Event update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'events' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'events' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE Policy: Event creators can delete event images
-- File must be in /events/{user_id}/ folder
CREATE POLICY "Event delete policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'events' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT Policy: Public read access for event media
-- Anyone can view event images (public discovery platform)
CREATE POLICY "Public event media access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events');

-- ═══════════════════════════════════════════════════════════════
-- BUCKET CONFIGURATION REFERENCE
-- ═══════════════════════════════════════════════════════════════
--
-- The following settings should be configured in Supabase Dashboard
-- or via the Management API (not SQL):
--
-- Avatars Bucket:
-- - Name: avatars
-- - Public: true
-- - File size limit: 2 MB (2097152 bytes)
-- - Allowed MIME types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- - Folder structure: avatars/{user_id}/{filename}
--
-- Posts Bucket:
-- - Name: posts
-- - Public: true
-- - File size limit: 10 MB (10485760 bytes)
-- - Allowed MIME types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
-- - Folder structure: posts/{user_id}/{filename}
--
-- Events Bucket:
-- - Name: events
-- - Public: true
-- - File size limit: 5 MB (5242880 bytes)
-- - Allowed MIME types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- - Folder structure: events/{user_id}/{filename}
--
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- STORAGE SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════
--
-- Folder Structure:
-- - All files MUST be uploaded to /{bucket_id}/{user_id}/{filename}
-- - storage.foldername(name)[1] extracts the first folder (user_id)
-- - This ensures users can only access their own folder
--
-- Public Read Access:
-- - All buckets have public SELECT policies (TO public)
-- - This allows displaying images without authentication
-- - Required for social platform features (profile pics, posts, events)
--
-- File Size Limits:
-- - Enforced at bucket level (not SQL policy)
-- - Configure via Supabase Dashboard or Management API
-- - Avatars: 2MB (reasonable for profile pictures)
-- - Posts: 10MB (allows high-quality images and short videos)
-- - Events: 5MB (balance between quality and storage)
--
-- MIME Type Restrictions:
-- - Enforced at bucket level (not SQL policy)
-- - Prevents uploading non-image/video files
-- - Reduces security risks (no executable files)
--
-- Upload Flow:
-- 1. Client authenticates with Supabase Auth
-- 2. Client uploads file to /{bucket}/{user_id}/{filename}
-- 3. RLS policy checks auth.uid() matches folder name
-- 4. Bucket validates file size and MIME type
-- 5. File stored and public URL generated
-- 6. Client saves URL to database (profiles.avatar_url, posts.image_url, etc.)
--
-- Security Considerations:
-- - Users cannot upload to other users' folders (RLS enforced)
-- - Users cannot delete other users' files (RLS enforced)
-- - File size limits prevent storage abuse
-- - MIME type restrictions prevent malicious uploads
-- - Public read access required for social features
-- - All uploads require authentication
--
-- Best Practices:
-- - Use unique filenames to prevent overwriting (e.g., {user_id}-{timestamp}.jpg)
-- - Delete old files when uploading new ones (especially avatars)
-- - Validate file types on client side before upload
-- - Show upload progress for better UX
-- - Handle upload errors gracefully
-- - Compress images client-side before upload
-- - Use WebP format for better compression
--
-- Cleanup Recommendations:
-- - Implement cascade deletes (delete files when user/post/event deleted)
-- - Schedule periodic cleanup of orphaned files
-- - Monitor storage usage per user
-- - Implement storage quotas if needed
--
-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKET POLICIES COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
