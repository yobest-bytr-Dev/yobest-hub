-- Drop ALL triggers on auth.users that might be failing
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users' AND event_object_schema = 'auth' LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON auth.users CASCADE';
  END LOOP;
END $$;

-- Drop functions that might be used by those triggers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.prokind = 'f' LOOP
    BEGIN
      EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '() CASCADE';
    EXCEPTION WHEN OTHERS THEN
      -- skip
    END;
  END LOOP;
END $$;

-- Make sure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Fix RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
