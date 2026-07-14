-- Yobest Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  roblox_id TEXT,
  display_name TEXT,
  bio TEXT DEFAULT '',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  games_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Experiences (games) table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Uncopylocked',
  price TEXT DEFAULT 'Free',
  video_url TEXT,
  game_url TEXT DEFAULT '',
  download_url TEXT DEFAULT '',
  thumbnail_url TEXT,
  is_official BOOLEAN DEFAULT false,
  game_play BOOLEAN DEFAULT false,
  download_enabled BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  price TEXT DEFAULT 'Free',
  video_url TEXT,
  game_url TEXT DEFAULT '',
  drive_file_url TEXT,
  screenshots_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Assets (marketplace) table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('script', 'model', 'uikit')),
  price_robux INTEGER DEFAULT 0,
  drive_file_url TEXT,
  thumbnail_url TEXT,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  prize TEXT DEFAULT '',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'upcoming')),
  participants_count INTEGER DEFAULT 0,
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);

-- Follow graph
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  group_id UUID,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI chat history
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  model TEXT DEFAULT 'google/gemini-2.5-flash',
  title TEXT DEFAULT 'New Chat',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

-- API keys table (for storing encrypted keys)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key_name TEXT UNIQUE NOT NULL,
  key_value TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Page views (visitor tracking)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Downloads tracking
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI sessions tracking
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS experiences_creator_id ON experiences(creator_id);
CREATE INDEX IF NOT EXISTS experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS experiences_is_official ON experiences(is_official);
CREATE INDEX IF NOT EXISTS submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS assets_creator_id ON assets(creator_id);
CREATE INDEX IF NOT EXISTS assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS reviews_experience_id ON reviews(experience_id);
CREATE INDEX IF NOT EXISTS page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS downloads_game_id ON downloads(game_id);
CREATE INDEX IF NOT EXISTS ai_sessions_created_at ON ai_sessions(created_at);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Experiences: public read, owner/admin write
CREATE POLICY "Experiences are viewable by everyone" ON experiences FOR SELECT USING (true);
CREATE POLICY "Users can create experiences" ON experiences FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own experiences" ON experiences FOR UPDATE USING (auth.uid() = creator_id);

-- Submissions: owner read/write, admin read
CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON submissions FOR UPDATE USING (auth.uid() = user_id);

-- Assets: public read, owner write
CREATE POLICY "Assets are viewable by everyone" ON assets FOR SELECT USING (true);
CREATE POLICY "Users can create assets" ON assets FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (auth.uid() = creator_id);

-- Messages: sender/receiver read
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- AI chats: owner only
CREATE POLICY "Users can view own chats" ON ai_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chats" ON ai_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON ai_chats FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: public read, owner write
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Follows: public read, owner write
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- API keys: admin only (service role)
CREATE POLICY "No public access to API keys" ON api_keys FOR ALL USING (false);

-- Page views: anyone can insert, no public read
CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);

-- Downloads: anyone can insert, no public read
CREATE POLICY "Anyone can insert downloads" ON downloads FOR INSERT WITH CHECK (true);

-- AI sessions: anyone can insert, no public read
CREATE POLICY "Anyone can insert ai sessions" ON ai_sessions FOR INSERT WITH CHECK (true);
