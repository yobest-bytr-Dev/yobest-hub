-- ============================================
-- YOBEST ANALYTICS — Run ONCE in Supabase SQL Editor
-- ============================================
-- 1. Go to https://supabase.com/dashboard → SQL Editor
-- 2. Paste everything below → click "Run"
-- ============================================

-- 1. Create the counters table
CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed the three counters
INSERT INTO site_stats (key, value) VALUES
  ('visits', 0),
  ('downloads', 0),
  ('ai_sessions', 0)
ON CONFLICT (key) DO NOTHING;

-- 3. Atomic increment function (SECURITY DEFINER = runs as owner, bypasses RLS)
CREATE OR REPLACE FUNCTION increment_stat(p_key TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO site_stats (key, value, updated_at)
  VALUES (p_key, 1, now())
  ON CONFLICT (key)
  DO UPDATE SET
    value = site_stats.value + 1,
    updated_at = now();
END;
$$;

-- 4. Allow anonymous + authenticated users to CALL the function
GRANT EXECUTE ON FUNCTION increment_stat(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_stat(TEXT) TO authenticated;

-- 5. Allow anyone to READ the counters
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON site_stats FOR SELECT USING (true);

-- 6. Allow service role full access
GRANT ALL ON site_stats TO service_role;
