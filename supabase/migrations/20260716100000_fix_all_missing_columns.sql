-- =============================================================================
-- FIX EVERYTHING: Add ALL missing columns, fix ALL policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)
-- =============================================================================

-- 1. Add missing columns to experiences table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'images') THEN
    ALTER TABLE public.experiences ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'gamepass_id') THEN
    ALTER TABLE public.experiences ADD COLUMN gamepass_id TEXT DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'gallery_images') THEN
    ALTER TABLE public.experiences ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'rating') THEN
    ALTER TABLE public.experiences ADD COLUMN rating DECIMAL(3,1) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'rating_count') THEN
    ALTER TABLE public.experiences ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Add missing columns to submissions table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE public.submissions ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

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

-- 3. Add missing columns to profiles table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE public.profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Create game_likes table if missing
CREATE TABLE IF NOT EXISTS public.game_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id)
);
ALTER TABLE public.game_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read game likes" ON public.game_likes;
CREATE POLICY "Anyone can read game likes" ON public.game_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like games" ON public.game_likes;
CREATE POLICY "Users can like games" ON public.game_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike games" ON public.game_likes;
CREATE POLICY "Users can unlike games" ON public.game_likes FOR DELETE USING (auth.uid() = user_id);

-- 5. Create game_views table if missing
CREATE TABLE IF NOT EXISTS public.game_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.game_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert game views" ON public.game_views;
CREATE POLICY "Anyone can insert game views" ON public.game_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read game views" ON public.game_views;
CREATE POLICY "Anyone can read game views" ON public.game_views FOR SELECT USING (true);

-- 6. Create game_comments table if missing
CREATE TABLE IF NOT EXISTS public.game_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.game_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read game comments" ON public.game_comments;
CREATE POLICY "Anyone can read game comments" ON public.game_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert game comments" ON public.game_comments;
CREATE POLICY "Users can insert game comments" ON public.game_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own game comments" ON public.game_comments;
CREATE POLICY "Users can update own game comments" ON public.game_comments FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own game comments" ON public.game_comments;
CREATE POLICY "Users can delete own game comments" ON public.game_comments FOR DELETE USING (auth.uid() = user_id);

-- 7. Create site_stats table if missing
CREATE TABLE IF NOT EXISTS public.site_stats (
  key TEXT PRIMARY KEY,
  value BIGINT DEFAULT 0
);
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read site stats" ON public.site_stats;
CREATE POLICY "Anyone can read site stats" ON public.site_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can update site stats" ON public.site_stats;
CREATE POLICY "Anyone can update site stats" ON public.site_stats FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone can insert site stats" ON public.site_stats;
CREATE POLICY "Anyone can insert site stats" ON public.site_stats FOR INSERT WITH CHECK (true);

-- 8. Create game_releases table if missing
CREATE TABLE IF NOT EXISTS public.game_releases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  target_type TEXT NOT NULL DEFAULT 'game',
  target_id TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  file_size BIGINT DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_prerelease BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.game_releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Releases are public" ON public.game_releases;
CREATE POLICY "Releases are public" ON public.game_releases FOR SELECT USING (true);

-- 9. Create game_purchases table if missing
CREATE TABLE IF NOT EXISTS public.game_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  gamepass_id TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.game_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own purchases" ON public.game_purchases;
CREATE POLICY "Users can read own purchases" ON public.game_purchases FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert purchases" ON public.game_purchases;
CREATE POLICY "Users can insert purchases" ON public.game_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create follows table if missing
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;
CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 11. Fix reviews table - drop FK on experience_id if needed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_experience_id_fkey') THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_experience_id_fkey;
  END IF;
END $$;

-- 12. Create RPC functions for follow counts
CREATE OR REPLACE FUNCTION public.increment_followers(target_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET followers_count = followers_count + 1 WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_followers(target_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_following(target_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET following_count = following_count + 1 WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_following(target_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create RPC for game views
CREATE OR REPLACE FUNCTION public.track_game_view(p_game_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO game_views (user_id, game_id) VALUES (auth.uid(), p_game_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_game_view_count(p_game_id TEXT)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::BIGINT FROM game_views WHERE game_id = p_game_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_game_view_counts(p_game_ids TEXT[])
RETURNS TABLE(game_id TEXT, view_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT gv.game_id, COUNT(*)::BIGINT as view_count
  FROM game_views gv
  WHERE gv.game_id = ANY(p_game_ids)
  GROUP BY gv.game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create RPC for stats
CREATE OR REPLACE FUNCTION public.increment_stat(p_key TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO site_stats (key, value) VALUES (p_key, 1)
  ON CONFLICT (key) DO UPDATE SET value = site_stats.value + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Seed site_stats
INSERT INTO site_stats (key, value) VALUES ('visits', 0), ('downloads', 0), ('ai_sessions', 0)
ON CONFLICT (key) DO NOTHING;

-- 16. Seed official games if experiences table is empty
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM experiences LIMIT 1) THEN
    INSERT INTO experiences (id, creator_id, title, description, category, price, video_url, game_url, download_url, thumbnail_url, is_official, game_play, download_enabled, views_count, likes_count)
    VALUES
      ('a1000000-0000-0000-0000-000000000001', NULL, 'Roblox Studio SharkBite UNCOPYLOCKED by BYTR', '', 'Uncopylocked', 'Free', 'https://www.youtube.com/watch?v=bRzzhZcNHr0', 'https://www.roblox.com/games/17410585589/Shark-BYTR', 'https://work.ink/1RdO/roblox-studio-sharkbite-uncopylocked-by-bytr', '', true, true, true, 12400, 340),
      ('a1000000-0000-0000-0000-000000000002', NULL, 'Roblox Studio Yobest Blade Ball uncopylocked all Scripts', '', 'Minigame', 'Free', 'https://www.youtube.com/watch?v=gHeW6FvXmkk', 'https://www.roblox.com/games/102296952865049/Yobest-Ball-Game', 'https://workink.net/1RdO/o1tps3s0', '', true, true, true, 8900, 210),
      ('a1000000-0000-0000-0000-000000000003', NULL, 'Roblox Studio Yobest tower defense Anime uncopylocked Up 3', '', 'Anime', 'Free', 'https://www.youtube.com/watch?v=XiGrxZNzpZM', 'https://www.roblox.com/games/16907652511/Yobests-Anime-Guardian-Clash-Up2', 'https://workink.net/1RdO/d072o5mz', '', true, true, true, 15600, 420),
      ('a1000000-0000-0000-0000-000000000004', NULL, 'Roblox Studio Yobest Anime vanguards uncopylocked (all Scripts by Yobest)', '', 'Paid', '600 Robux', 'https://www.youtube.com/watch?v=o3VxS9r2OwY', 'https://www.roblox.com/games/82747399384275/Anime-Yobest-Av-up2', 'https://www.roblox.com/game-pass/1012039728/Display-All-Units', '', true, true, true, 22300, 580),
      ('a1000000-0000-0000-0000-000000000005', NULL, 'Toilet tower defense uncopylocked UP4 By BYTR', '', 'Tower Defense', 'Free', 'https://www.youtube.com/watch?v=6mDovQ4d87M', 'https://www.roblox.com/games/15958463952/skibidi-tower-defense-BYTR-UP-4', 'https://workink.net/1RdO/fhj69ej0', '', true, true, true, 31500, 720),
      ('a1000000-0000-0000-0000-000000000006', NULL, 'Roblox studio Pet trade System Up 1 By BYTR', '', 'Template', 'Free', 'https://www.youtube.com/watch?v=pMrRFF7dHYM', '', 'https://mega.nz/file/YTd1gJqa#NzndT5ZOZS4wjo1gc9j7XHdsuBOMFvvHkb9y34EbESw', '', true, false, true, 5400, 120),
      ('a1000000-0000-0000-0000-000000000007', NULL, 'tower defense Anime Update 2 BYTR uncopylocked', '', 'Tower Defense', 'Free', 'https://www.youtube.com/watch?v=97f1sqtWy6o', 'https://www.roblox.com/games/14372275044/tower-defense-Anime', 'https://work.ink/1RdO/lmm1ufst', '', true, true, true, 9800, 250),
      ('a1000000-0000-0000-0000-000000000008', NULL, 'Robot Simulator BYTR uncopylocked', '', 'Script Kit', 'Free', 'https://www.youtube.com/watch?v=dsDqBZBLpfg', '', 'https://workink.net/1RdO/lmfdv0b3', '', true, false, true, 3200, 85),
      ('a1000000-0000-0000-0000-000000000009', NULL, 'Roblox Studio Real pls donate Game BYTR uncopylocked', '', 'Script Kit', 'Free', 'https://www.youtube.com/watch?v=w9OLn8YValE', '', 'https://workink.net/1RdO/ltk7rklv', '', true, false, true, 7100, 190),
      ('a1000000-0000-0000-0000-000000000010', NULL, 'Roblox studio Pet trade System and Trade chat BYTR', '', 'Script Kit', 'Free', 'https://www.youtube.com/watch?v=kXMamYt5Zd8', '', 'https://workink.net/1RdO/lu5jed0c', '', true, false, true, 4500, 110),
      ('a1000000-0000-0000-0000-000000000011', NULL, 'Real donation game uncopylocked BYTR', '', 'Core API', 'Free', 'https://www.youtube.com/watch?v=5BYv9x_E2Iw', '', 'https://workink.net/1RdO/lsgkci8u', '', true, false, true, 6200, 160),
      ('a1000000-0000-0000-0000-000000000012', NULL, 'Race Cliker BYTR uncopylocked', '', 'Script Kit', 'Free', 'https://www.youtube.com/watch?v=bW3ILQnV6Rw', '', 'https://workink.net/1RdO/ln08hlhk', '', true, false, true, 2800, 70),
      ('a1000000-0000-0000-0000-000000000013', NULL, 'Pet Companions BYTR uncopylocked', '', 'UI Kit', 'Free', 'https://www.youtube.com/watch?v=KATJLumZSOs', '', 'https://workink.net/1RdO/lm95jqw3', '', true, false, true, 4100, 95)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
