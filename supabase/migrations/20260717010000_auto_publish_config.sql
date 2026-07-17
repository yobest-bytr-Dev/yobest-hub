-- Add auto-publish config keys
-- Safe to re-run (uses ON CONFLICT DO NOTHING)

INSERT INTO bot_config (key,value,updated_by) VALUES
  ('auto_publish_games','false','system'),
  ('auto_publish_assets','false','system')
ON CONFLICT (key) DO NOTHING;
