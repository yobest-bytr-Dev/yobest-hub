-- Game likes table
CREATE TABLE IF NOT EXISTS game_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Game comments table
CREATE TABLE IF NOT EXISTS game_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_likes_game_id ON game_likes(game_id);
CREATE INDEX IF NOT EXISTS game_likes_user_id ON game_likes(user_id);
CREATE INDEX IF NOT EXISTS game_comments_game_id ON game_comments(game_id);
CREATE INDEX IF NOT EXISTS game_comments_created_at ON game_comments(created_at);

ALTER TABLE game_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game likes viewable by everyone" ON game_likes FOR SELECT USING (true);
CREATE POLICY "Users can like games" ON game_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike games" ON game_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Game comments viewable by everyone" ON game_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON game_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON game_comments FOR DELETE USING (auth.uid() = user_id);
