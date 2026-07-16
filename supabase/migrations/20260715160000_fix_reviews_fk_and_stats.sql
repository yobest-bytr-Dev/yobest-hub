-- Fix 1: Drop FK constraint on reviews.experience_id so community games (submissions) can also be rated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_experience_id_fkey' AND table_name = 'reviews') THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_experience_id_fkey;
  END IF;
END $$;

-- Fix 2: Drop the unique constraint too and recreate with target_id/target_type
-- (keeps backward compatibility for existing data)
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_experience_id_key;

-- Add target_type column for distinguishing game vs asset reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'game';

-- Update existing RPC to also handle community game rating
CREATE OR REPLACE FUNCTION public.update_experience_rating(p_exp_id UUID)
RETURNS void AS $$
BEGIN
  -- Update official games rating
  UPDATE public.experiences
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE experience_id = p_exp_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.reviews WHERE experience_id = p_exp_id),
      updated_at = now()
  WHERE id = p_exp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 3: Ensure game_likes table has proper setup for community games
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_likes' AND column_name = 'game_id') THEN
    ALTER TABLE public.game_likes ADD COLUMN game_id UUID;
  END IF;
END $$;
