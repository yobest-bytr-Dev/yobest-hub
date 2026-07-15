-- Add gallery images and gamepass_id to experiences table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'images') THEN
    ALTER TABLE public.experiences ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'gamepass_id') THEN
    ALTER TABLE public.experiences ADD COLUMN gamepass_id TEXT DEFAULT '';
  END IF;
END $$;

-- Add gallery_images and gamepass_url to submissions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'gallery_images') THEN
    ALTER TABLE public.submissions ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'gamepass_url') THEN
    ALTER TABLE public.submissions ADD COLUMN gamepass_url TEXT DEFAULT '';
  END IF;
END $$;

-- Fix approved community games to be publicly visible (override owner-only read)
DROP POLICY IF EXISTS "Approved community games are public" ON public.experiences;
CREATE POLICY "Approved community games are public" ON public.experiences
  FOR SELECT USING (true);
