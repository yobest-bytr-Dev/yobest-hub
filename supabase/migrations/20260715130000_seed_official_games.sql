-- Seed 13 official games into experiences table
-- These are the original official games from the Yobest team

INSERT INTO experiences (id, creator_id, title, description, category, price, video_url, game_url, download_url, thumbnail_url, is_official, game_play, download_enabled, views_count, likes_count)
VALUES
  ('a1000000-0000-0000-0000-000000000001', NULL, 'Roblox Studio SharkBite UNCOPYLOCKED by BYTR', '', 'Uncopylocked', 'Free',
   'https://www.youtube.com/watch?v=bRzzhZcNHr0', 'https://www.roblox.com/games/17410585589/Shark-BYTR',
   'https://work.ink/1RdO/roblox-studio-sharkbite-uncopylocked-by-bytr', '', true, true, true, 12400, 340),

  ('a1000000-0000-0000-0000-000000000002', NULL, 'Roblox Studio Yobest Blade Ball uncopylocked all Scripts', '', 'Minigame', 'Free',
   'https://www.youtube.com/watch?v=gHeW6FvXmkk', 'https://www.roblox.com/games/102296952865049/Yobest-Ball-Game',
   'https://workink.net/1RdO/o1tps3s0', '', true, true, true, 8900, 210),

  ('a1000000-0000-0000-0000-000000000003', NULL, 'Roblox Studio Yobest tower defense Anime uncopylocked Up 3', '', 'Anime', 'Free',
   'https://www.youtube.com/watch?v=XiGrxZNzpZM', 'https://www.roblox.com/games/16907652511/Yobests-Anime-Guardian-Clash-Up2',
   'https://workink.net/1RdO/d072o5mz', '', true, true, true, 15600, 420),

  ('a1000000-0000-0000-0000-000000000004', NULL, 'Roblox Studio Yobest Anime vanguards uncopylocked (all Scripts by Yobest)', '', 'Paid', '600 Robux',
   'https://www.youtube.com/watch?v=o3VxS9r2OwY', 'https://www.roblox.com/games/82747399384275/Anime-Yobest-Av-up2',
   'https://www.roblox.com/game-pass/1012039728/Display-All-Units', '', true, true, true, 22300, 580),

  ('a1000000-0000-0000-0000-000000000005', NULL, 'Toilet tower defense uncopylocked UP4 By BYTR', '', 'Tower Defense', 'Free',
   'https://www.youtube.com/watch?v=6mDovQ4d87M', 'https://www.roblox.com/games/15958463952/skibidi-tower-defense-BYTR-UP-4',
   'https://workink.net/1RdO/fhj69ej0', '', true, true, true, 31500, 720),

  ('a1000000-0000-0000-0000-000000000006', NULL, 'Roblox studio Pet trade System Up 1 By BYTR', '', 'Template', 'Free',
   'https://www.youtube.com/watch?v=pMrRFF7dHYM', '',
   'https://mega.nz/file/YTd1gJqa#NzndT5ZOZS4wjo1gc9j7XHdsuBOMFvvHkb9y34EbESw', '', true, false, true, 5400, 120),

  ('a1000000-0000-0000-0000-000000000007', NULL, 'tower defense Anime Update 2 BYTR uncopylocked', '', 'Tower Defense', 'Free',
   'https://www.youtube.com/watch?v=97f1sqtWy6o', 'https://www.roblox.com/games/14372275044/tower-defense-Anime',
   'https://work.ink/1RdO/lmm1ufst', '', true, true, true, 9800, 250),

  ('a1000000-0000-0000-0000-000000000008', NULL, 'Robot Simulator BYTR uncopylocked', '', 'Script Kit', 'Free',
   'https://www.youtube.com/watch?v=dsDqBZBLpfg', '',
   'https://workink.net/1RdO/lmfdv0b3', '', true, false, true, 3200, 85),

  ('a1000000-0000-0000-0000-000000000009', NULL, 'Roblox Studio Real pls donate Game BYTR uncopylocked', '', 'Script Kit', 'Free',
   'https://www.youtube.com/watch?v=w9OLn8YValE', '',
   'https://workink.net/1RdO/ltk7rklv', '', true, false, true, 7100, 190),

  ('a1000000-0000-0000-0000-000000000010', NULL, 'Roblox studio Pet trade System and Trade chat BYTR', '', 'Script Kit', 'Free',
   'https://www.youtube.com/watch?v=kXMamYt5Zd8', '',
   'https://workink.net/1RdO/lu5jed0c', '', true, false, true, 4500, 110),

  ('a1000000-0000-0000-0000-000000000011', NULL, 'Real donation game uncopylocked BYTR', '', 'Core API', 'Free',
   'https://www.youtube.com/watch?v=5BYv9x_E2Iw', '',
   'https://workink.net/1RdO/lsgkci8u', '', true, false, true, 6200, 160),

  ('a1000000-0000-0000-0000-000000000012', NULL, 'Race Cliker BYTR uncopylocked', '', 'Script Kit', 'Free',
   'https://www.youtube.com/watch?v=bW3ILQnV6Rw', '',
   'https://workink.net/1RdO/ln08hlhk', '', true, false, true, 2800, 70),

  ('a1000000-0000-0000-0000-000000000013', NULL, 'Pet Companions BYTR uncopylocked', '', 'UI Kit', 'Free',
   'https://www.youtube.com/watch?v=KATJLumZSOs', '',
   'https://workink.net/1RdO/lm95jqw3', '', true, false, true, 4100, 95)

ON CONFLICT (id) DO NOTHING;
