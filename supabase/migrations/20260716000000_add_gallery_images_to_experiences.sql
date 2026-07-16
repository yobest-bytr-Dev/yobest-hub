-- Add gallery_images column to experiences table (matches submissions.gallery_images)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'gallery_images') THEN
    ALTER TABLE public.experiences ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
  END IF;
END $$;
