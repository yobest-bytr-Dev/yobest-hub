-- Add channels column to bot_guilds so website can show channel pickers
ALTER TABLE bot_guilds ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '[]'::jsonb;
