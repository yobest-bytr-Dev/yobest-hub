-- Add UPDATE and DELETE policies for game_comments
-- (tables already exist, just need the missing policies)

-- Allow users to update their own comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own comments' AND tablename = 'game_comments'
  ) THEN
    CREATE POLICY "Users can update own comments" ON game_comments
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Allow users to delete their own comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own game comments' AND tablename = 'game_comments'
  ) THEN
    CREATE POLICY "Users can delete own game comments" ON game_comments
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
