-- Create yobest_tools table for the Yobest Tools page
CREATE TABLE IF NOT EXISTS public.yobest_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'soon' CHECK (status IN ('ready', 'beta', 'soon', 'deprecated')),
  download_url TEXT DEFAULT '',
  version TEXT DEFAULT '',
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yobest_tools ENABLE ROW LEVEL SECURITY;

-- Anyone can read tools
CREATE POLICY "Anyone can view tools" ON public.yobest_tools
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete (admin check done in app)
CREATE POLICY "Authenticated users can manage tools" ON public.yobest_tools
  FOR ALL USING (auth.role() = 'authenticated');

-- Add is_banned and ban_reason to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_banned') THEN
    ALTER TABLE public.profiles ADD COLUMN is_banned BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ban_reason') THEN
    ALTER TABLE public.profiles ADD COLUMN ban_reason TEXT DEFAULT '';
  END IF;
END $$;
