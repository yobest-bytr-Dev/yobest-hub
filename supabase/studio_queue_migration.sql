-- studio_queue: Website -> Studio plugin code deployment
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS studio_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL,
  code TEXT NOT NULL,
  script_name TEXT DEFAULT 'YobestAI_Script',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast polling by token
CREATE INDEX IF NOT EXISTS idx_studio_queue_token_status
  ON studio_queue (token, status, created_at);

-- RLS: service role only (edge function uses service role key)
ALTER TABLE studio_queue ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert (website sends code)
CREATE POLICY "Allow anon insert" ON studio_queue
  FOR INSERT TO anon
  WITH CHECK (true);

-- Cleanup old delivered entries (run periodically or add cron)
-- DELETE FROM studio_queue WHERE status = 'delivered' AND created_at < NOW() - INTERVAL '1 hour';
