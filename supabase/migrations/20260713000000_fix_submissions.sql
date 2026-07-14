-- 1. Set ByocefS as admin (case-insensitive match)
UPDATE profiles SET is_admin = true WHERE lower(username) = lower('ByocefS');

-- 2. Add missing columns to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS gamepass_url TEXT;

-- 3. Allow anyone to view approved submissions (Community Games tab)
DROP POLICY IF EXISTS "Approved submissions are public" ON submissions;
CREATE POLICY "Approved submissions are public" ON submissions
  FOR SELECT USING (status = 'approved');

-- 4. Allow owner to delete/update their own experiences
DROP POLICY IF EXISTS "Owners can delete own experiences" ON experiences;
CREATE POLICY "Owners can delete own experiences" ON experiences
  FOR DELETE USING (auth.uid() = creator_id);

-- 5. Allow owner to delete/update their own assets
DROP POLICY IF EXISTS "Owners can delete own assets" ON assets;
CREATE POLICY "Owners can delete own assets" ON assets
  FOR DELETE USING (auth.uid() = creator_id);
