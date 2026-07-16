-- Bot tables for Discord bot integration (migrated from Neon to Supabase)
-- Safe to re-run — every statement is idempotent.

-- Guild settings
CREATE TABLE IF NOT EXISTS bot_guild_settings (
  guild_id TEXT PRIMARY KEY,
  mod_role_id TEXT,
  auto_role_id TEXT,
  welcome_channel TEXT,
  goodbye_channel TEXT,
  modlog_channel TEXT,
  ticket_category TEXT,
  welcome_message TEXT,
  goodbye_message TEXT,
  ticket_log_channel TEXT,
  ticket_panel_channel TEXT,
  ticket_name_prefix TEXT DEFAULT 'ticket',
  roblox_updates_channel TEXT,
  game_announce_channel TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- XP / leveling
CREATE TABLE IF NOT EXISTS bot_xp (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Warnings / moderation
CREATE TABLE IF NOT EXISTS bot_warnings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  guild_id TEXT,
  reason TEXT NOT NULL,
  warned_by TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bot_warnings_user_idx ON bot_warnings(user_id);

-- Custom commands
CREATE TABLE IF NOT EXISTS bot_custom_commands (
  guild_id TEXT NOT NULL,
  trigger TEXT NOT NULL,
  response TEXT NOT NULL,
  PRIMARY KEY (guild_id, trigger)
);

-- Reaction roles
CREATE TABLE IF NOT EXISTS bot_reaction_roles (
  guild_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  role_id TEXT NOT NULL,
  PRIMARY KEY (guild_id, message_id, emoji)
);

-- Tickets
CREATE TABLE IF NOT EXISTS bot_tickets (
  channel_id TEXT PRIMARY KEY,
  guild_id TEXT,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Scripts
CREATE TABLE IF NOT EXISTS bot_scripts (
  script_id TEXT PRIMARY KEY,
  guild_id TEXT,
  channel_id TEXT,
  title TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'lua',
  script TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bot games (Discord side)
CREATE TABLE IF NOT EXISTS bot_games (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  play_url TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'live',
  added_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guild snapshots
CREATE TABLE IF NOT EXISTS bot_guilds (
  guild_id TEXT PRIMARY KEY,
  name TEXT,
  icon_url TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  boost_level INTEGER NOT NULL DEFAULT 0,
  boost_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guild stats history
CREATE TABLE IF NOT EXISTS bot_guild_stats_history (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  member_count INTEGER NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bot_guild_history_idx ON bot_guild_stats_history(guild_id, captured_at DESC);

-- Bot heartbeat
CREATE TABLE IF NOT EXISTS bot_heartbeat (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bot config (key-value)
CREATE TABLE IF NOT EXISTS bot_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO bot_config (key, value, updated_by) VALUES
  ('ai_system_prompt', 'You are Yobest_BYTR, a friendly Discord bot for Yobest Studio. Help with Roblox game development, Lua scripting, and community questions.', 'system'),
  ('ai_enabled', 'true', 'system'),
  ('ai_model', 'openai/gpt-4o-mini', 'system'),
  ('xp_enabled', 'true', 'system'),
  ('automod_enabled', 'true', 'system'),
  ('welcome_enabled', 'true', 'system')
ON CONFLICT (key) DO NOTHING;

-- Web commands (website → bot)
CREATE TABLE IF NOT EXISTS web_commands (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  command TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS web_commands_pending ON web_commands(status, created_at) WHERE status = 'pending';

-- Mod roles
CREATE TABLE IF NOT EXISTS bot_guild_mod_roles (
  guild_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  PRIMARY KEY (guild_id, role_id)
);

-- Command permissions
CREATE TABLE IF NOT EXISTS bot_command_permissions (
  guild_id TEXT NOT NULL,
  command TEXT NOT NULL,
  min_level TEXT NOT NULL,
  PRIMARY KEY (guild_id, command)
);

-- RLS: only service role can access bot tables (edge functions use service role)
ALTER TABLE bot_guild_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_custom_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_reaction_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_guild_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_heartbeat ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_guild_mod_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_command_permissions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "service_all_bot_guild_settings" ON bot_guild_settings FOR ALL USING (true);
CREATE POLICY "service_all_bot_xp" ON bot_xp FOR ALL USING (true);
CREATE POLICY "service_all_bot_warnings" ON bot_warnings FOR ALL USING (true);
CREATE POLICY "service_all_bot_custom_commands" ON bot_custom_commands FOR ALL USING (true);
CREATE POLICY "service_all_bot_reaction_roles" ON bot_reaction_roles FOR ALL USING (true);
CREATE POLICY "service_all_bot_tickets" ON bot_tickets FOR ALL USING (true);
CREATE POLICY "service_all_bot_scripts" ON bot_scripts FOR ALL USING (true);
CREATE POLICY "service_all_bot_games" ON bot_games FOR ALL USING (true);
CREATE POLICY "service_all_bot_guilds" ON bot_guilds FOR ALL USING (true);
CREATE POLICY "service_all_bot_guild_stats_history" ON bot_guild_stats_history FOR ALL USING (true);
CREATE POLICY "service_all_bot_heartbeat" ON bot_heartbeat FOR ALL USING (true);
CREATE POLICY "service_all_bot_config" ON bot_config FOR ALL USING (true);
CREATE POLICY "service_all_web_commands" ON web_commands FOR ALL USING (true);
CREATE POLICY "service_all_bot_guild_mod_roles" ON bot_guild_mod_roles FOR ALL USING (true);
CREATE POLICY "service_all_bot_command_permissions" ON bot_command_permissions FOR ALL USING (true);

-- Add discord_user_id to profiles for account linking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_avatar TEXT;
