-- Fix: increment_stat RPC function (was called but never created)
CREATE OR REPLACE FUNCTION public.increment_stat(p_key TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.site_stats (key, value, updated_at)
  VALUES (p_key, 1, now())
  ON CONFLICT (key)
  DO UPDATE SET value = public.site_stats.value + 1, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: increment_asset_downloads RPC
CREATE OR REPLACE FUNCTION public.increment_asset_downloads(p_asset_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.assets SET downloads_count = downloads_count + 1, updated_at = now() WHERE id = p_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: increment_tool_downloads RPC
CREATE OR REPLACE FUNCTION public.increment_tool_downloads(p_tool_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.yobest_tools SET downloads_count = downloads_count + 1 WHERE id = p_tool_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: increment_experience_downloads RPC
CREATE OR REPLACE FUNCTION public.increment_experience_downloads(p_exp_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.experiences SET views_count = views_count + 1, updated_at = now() WHERE id = p_exp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asset reviews table (for rating assets in marketplace)
CREATE TABLE IF NOT EXISTS public.asset_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

ALTER TABLE public.asset_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Asset reviews are viewable by everyone" ON public.asset_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create asset reviews" ON public.asset_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own asset reviews" ON public.asset_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Ensure experiences table has rating columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'rating') THEN
    ALTER TABLE public.experiences ADD COLUMN rating DECIMAL(2,1) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'rating_count') THEN
    ALTER TABLE public.experiences ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Reviews table (make sure it exists - was in schema.sql but might not be deployed)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- RPC to update experience rating after review
CREATE OR REPLACE FUNCTION public.update_experience_rating(p_exp_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.experiences
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE experience_id = p_exp_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.reviews WHERE experience_id = p_exp_id),
      updated_at = now()
  WHERE id = p_exp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to update asset rating after review
CREATE OR REPLACE FUNCTION public.update_asset_rating(p_asset_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.assets
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.asset_reviews WHERE asset_id = p_asset_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.asset_reviews WHERE asset_id = p_asset_id),
      updated_at = now()
  WHERE id = p_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
