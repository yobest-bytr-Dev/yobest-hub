-- =====================================================
-- FIX 1: Fix reviews table constraints
-- Drop the FK constraint so community games can be rated
-- Recreate unique constraint that was accidentally dropped
-- =====================================================

-- Drop the FK constraint (try common naming patterns)
DO $$
DECLARE
  conname TEXT;
BEGIN
  SELECT tc.constraint_name INTO conname
  FROM information_schema.table_constraints tc
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'reviews'
    AND tc.table_schema = 'public'
    AND EXISTS (
      SELECT 1 FROM information_schema.constraint_column_usage ccu
      WHERE ccu.constraint_name = tc.constraint_name
        AND ccu.table_name = 'reviews'
        AND ccu.column_name = 'experience_id'
    );
  IF conname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT ' || quote_ident(conname);
    RAISE NOTICE 'Dropped FK constraint: %', conname;
  END IF;
END $$;

-- Recreate unique constraint on (user_id, experience_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_user_id_experience_id_key'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_user_id_experience_id_key
      UNIQUE (user_id, experience_id);
    RAISE NOTICE 'Recreated unique constraint';
  END IF;
END $$;

-- =====================================================
-- FIX 2: Create game_views table for server-side view tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS public.game_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id TEXT NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast count queries
CREATE INDEX IF NOT EXISTS idx_game_views_game_id ON public.game_views(game_id);

-- RLS: anyone can read counts, only authenticated can insert
ALTER TABLE public.game_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Game views are public' AND tablename = 'game_views') THEN
    CREATE POLICY "Game views are public" ON public.game_views FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can track views' AND tablename = 'game_views') THEN
    CREATE POLICY "Anyone can track views" ON public.game_views FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- RPC: Track a game view (deduplicates by game_id + viewer_id per hour)
CREATE OR REPLACE FUNCTION public.track_game_view(p_game_id TEXT)
RETURNS void AS $$
BEGIN
  -- Only insert if no view from this user in the last hour
  INSERT INTO public.game_views (game_id, viewer_id, created_at)
  SELECT p_game_id, auth.uid(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.game_views
    WHERE game_id = p_game_id
      AND viewer_id = auth.uid()
      AND created_at > now() - interval '1 hour'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get view count for a game
CREATE OR REPLACE FUNCTION public.get_game_view_count(p_game_id TEXT)
RETURNS BIGINT AS $$
  SELECT COUNT(*)::BIGINT FROM public.game_views WHERE game_id = p_game_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC: Get view counts for multiple games at once
CREATE OR REPLACE FUNCTION public.get_game_view_counts(p_game_ids TEXT[])
RETURNS TABLE(game_id TEXT, view_count BIGINT) AS $$
  SELECT gv.game_id, COUNT(*)::BIGINT as view_count
  FROM public.game_views gv
  WHERE gv.game_id = ANY(p_game_ids)
  GROUP BY gv.game_id;
$$ LANGUAGE sql SECURITY DEFINER;
