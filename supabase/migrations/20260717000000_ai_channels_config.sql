-- Add AI channels and default config keys for web control
-- Safe to re-run (uses ON CONFLICT DO NOTHING)

INSERT INTO bot_config (key,value,updated_by) VALUES
  ('ai_channels','[]','system'),
  ('default_guild_id','','system'),
  ('disabled_commands','[]','system'),
  ('command_channels','{}','system'),
  ('channel_feeds','{}','system')
ON CONFLICT (key) DO NOTHING;
