-- Yobest v2 Migration — Game Interactions, Messages fix, Gamepass fields
-- Run this ENTIRE file in Supabase SQL Editor

-- ═══════════════════════════════════════════════
-- 1. GAME LIKES TABLE
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_game_likes_game_id ON game_likes(game_id);
CREATE INDEX IF NOT EXISTS idx_game_likes_user_id ON game_likes(user_id);

ALTER TABLE game_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Game likes viewable by everyone" ON game_likes;
DROP POLICY IF EXISTS "Users can like games" ON game_likes;
DROP POLICY IF EXISTS "Users can unlike games" ON game_likes;

CREATE POLICY "Game likes viewable by everyone" ON game_likes FOR SELECT USING (true);
CREATE POLICY "Users can like games" ON game_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike games" ON game_likes FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 2. GAME COMMENTS TABLE
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_comments_game_id ON game_comments(game_id);
CREATE INDEX IF NOT EXISTS idx_game_comments_created_at ON game_comments(created_at);

ALTER TABLE game_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Game comments viewable by everyone" ON game_comments;
DROP POLICY IF EXISTS "Users can comment" ON game_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON game_comments;

CREATE POLICY "Game comments viewable by everyone" ON game_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON game_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON game_comments FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 3. MESSAGES — ADD UPDATE POLICY (mark as read)
-- ═══════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update received messages'
    AND tablename = 'messages'
  ) THEN
    CREATE POLICY "Users can update received messages"
      ON messages FOR UPDATE
      USING (auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = receiver_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 4. SUBMISSIONS — ADD GAMEPASS + THUMBNAIL FIELDS
-- ═══════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'gamepass_url') THEN
    ALTER TABLE submissions ADD COLUMN gamepass_url TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE submissions ADD COLUMN thumbnail_url TEXT DEFAULT '';
  END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 5. ASSETS — ADD GAMEPASS FIELD
-- ═══════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'gamepass_id') THEN
    ALTER TABLE assets ADD COLUMN gamepass_id TEXT DEFAULT '';
  END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 6. GAMEPASS PURCHASES TRACKING
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS gamepass_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gamepass_id TEXT NOT NULL,
  game_id TEXT,
  asset_id UUID,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gamepass_id)
);

CREATE INDEX IF NOT EXISTS idx_gp_purchases_user ON gamepass_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gp_purchases_gp ON gamepass_purchases(gamepass_id);

ALTER TABLE gamepass_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON gamepass_purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON gamepass_purchases;
DROP POLICY IF EXISTS "Users can update own purchases" ON gamepass_purchases;

CREATE POLICY "Users can view own purchases" ON gamepass_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON gamepass_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchases" ON gamepass_purchases FOR UPDATE USING (auth.uid() = user_id);
