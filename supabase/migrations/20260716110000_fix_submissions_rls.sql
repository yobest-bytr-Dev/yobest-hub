-- FIX: Add missing INSERT and UPDATE RLS policies for submissions table
-- Without these, all saves silently fail!

-- Enable RLS (idempotent)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own submissions
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.submissions;
CREATE POLICY "Users can insert own submissions" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow owners to update their own submissions
DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
CREATE POLICY "Users can update own submissions" ON public.submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow owners to delete their own submissions
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.submissions;
CREATE POLICY "Users can delete own submissions" ON public.submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure all submissions columns exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'gamepass_url') THEN
    ALTER TABLE public.submissions ADD COLUMN gamepass_url TEXT DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'gallery_images') THEN
    ALTER TABLE public.submissions ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE public.submissions ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

-- Ensure experiences has gamepass_id and images columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'gamepass_id') THEN
    ALTER TABLE public.experiences ADD COLUMN gamepass_id TEXT DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'images') THEN
    ALTER TABLE public.experiences ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ensure experiences has INSERT/UPDATE RLS policies
DROP POLICY IF EXISTS "Users can insert experiences" ON public.experiences;
CREATE POLICY "Users can insert experiences" ON public.experiences
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update own experiences" ON public.experiences;
CREATE POLICY "Users can update own experiences" ON public.experiences
  FOR UPDATE USING (auth.uid() = creator_id);

-- Ensure assets has INSERT/UPDATE RLS policies
DROP POLICY IF EXISTS "Users can insert assets" ON public.assets;
CREATE POLICY "Users can insert assets" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update own assets" ON public.assets;
CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE USING (auth.uid() = creator_id);
