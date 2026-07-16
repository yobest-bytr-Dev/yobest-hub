-- RPC functions to bypass RLS for submissions and experiences updates
-- These run as SECURITY DEFINER (superuser) so RLS is bypassed
-- But they check user_id = auth.uid() to ensure users can only modify their own data

-- Update submission (bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_submission_safe(
  p_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_price TEXT,
  p_video_url TEXT DEFAULT '',
  p_game_url TEXT DEFAULT '',
  p_drive_file_url TEXT DEFAULT '',
  p_gamepass_url TEXT DEFAULT '',
  p_thumbnail_url TEXT DEFAULT ''
)
RETURNS void AS $$
BEGIN
  UPDATE public.submissions SET
    title = p_title,
    description = p_description,
    category = p_category,
    price = p_price,
    video_url = p_video_url,
    game_url = p_game_url,
    drive_file_url = p_drive_file_url,
    gamepass_url = p_gamepass_url,
    thumbnail_url = p_thumbnail_url
  WHERE id = p_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update experience (bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_experience_safe(
  p_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_price TEXT,
  p_video_url TEXT DEFAULT '',
  p_game_url TEXT DEFAULT '',
  p_download_url TEXT DEFAULT '',
  p_thumbnail_url TEXT DEFAULT '',
  p_download_enabled BOOLEAN DEFAULT true,
  p_game_play BOOLEAN DEFAULT false,
  p_gamepass_id TEXT DEFAULT ''
)
RETURNS void AS $$
BEGIN
  UPDATE public.experiences SET
    title = p_title,
    description = p_description,
    category = p_category,
    price = p_price,
    video_url = p_video_url,
    game_url = p_game_url,
    download_url = p_download_url,
    thumbnail_url = p_thumbnail_url,
    download_enabled = p_download_enabled,
    game_play = p_game_play,
    gamepass_id = p_gamepass_id
  WHERE id = p_id AND creator_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
