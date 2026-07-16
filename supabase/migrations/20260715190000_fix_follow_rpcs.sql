-- RPC to increment followers_count on any profile (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_followers(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to decrement followers_count on any profile
CREATE OR REPLACE FUNCTION public.decrement_followers(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to increment following_count (on own profile, but also SECURITY DEFINER for consistency)
CREATE OR REPLACE FUNCTION public.increment_following(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to decrement following_count
CREATE OR REPLACE FUNCTION public.decrement_following(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
