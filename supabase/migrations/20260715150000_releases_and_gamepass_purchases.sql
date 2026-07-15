-- GitHub-style releases system for games and assets
DROP TABLE IF EXISTS releases CASCADE;
CREATE TABLE releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('game', 'asset')),
  target_id UUID NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  file_size TEXT DEFAULT '',
  author_id UUID REFERENCES auth.users(id),
  is_prerelease BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_releases_target ON releases (target_type, target_id, created_at DESC);

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read releases" ON releases FOR SELECT USING (true);
CREATE POLICY "Admins can insert releases" ON releases FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update releases" ON releases FOR UPDATE USING (true);
CREATE POLICY "Admins can delete releases" ON releases FOR DELETE USING (true);

-- Gamepass purchase verification table
CREATE TABLE IF NOT EXISTS gamepass_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gamepass_id TEXT NOT NULL,
  game_id UUID,
  asset_id UUID,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gamepass_id)
);

ALTER TABLE gamepass_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases" ON gamepass_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON gamepass_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchases" ON gamepass_purchases FOR UPDATE USING (auth.uid() = user_id);
