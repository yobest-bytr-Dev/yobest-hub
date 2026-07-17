export interface Experience {
  id: string
  creator: string
  creator_id?: string
  title: string
  description?: string
  video_url: string
  download_url: string
  download_enabled: boolean
  game_url: string
  game_play: boolean
  price: string
  category: string
  thumbnail_url?: string
  images?: string[]
  gallery_images?: string[]
  gamepass_id?: string
  views_count?: number
  likes_count?: number
  rating?: number
  rating_count?: number
  is_official: boolean
  created_at?: string
}

export interface Submission {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  price: string
  video_url: string
  game_url: string
  drive_file_url: string
  gamepass_url?: string
  gallery_images?: string[]
  thumbnail_url?: string
  screenshots_urls: string[]
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
}

export interface UserProfile {
  id: string
  username: string
  display_name?: string
  avatar_url: string
  roblox_id?: string
  bio?: string
  avatar_decoration?: string | null
  followers_count: number
  following_count: number
  games_count: number
  is_admin: boolean
  discord_user_id?: string
  discord_username?: string
  discord_avatar?: string
  created_at: string
}

export interface Asset {
  id: string
  creator_id: string
  title: string
  description: string
  type: 'script' | 'model' | 'uikit'
  price_robux: number
  drive_file_url: string
  thumbnail_url: string
  gamepass_id?: string
  gallery_images?: string[]
  downloads_count: number
  rating: number
  rating_count: number
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  prize: string
  start_date: string
  end_date: string
  participants_count: number
  status: 'active' | 'ended' | 'upcoming'
  winner_id?: string
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  experience_id: string
  rating: number
  comment: string
  created_at: string
}

export type GameCategory =
  | 'All'
  | 'Uncopylocked'
  | 'Minigame'
  | 'Anime'
  | 'Paid'
  | 'Tower Defense'
  | 'Script Kit'
  | 'UI Kit'
  | 'Core API'
  | 'Template'

export interface Release {
  id: string
  target_type: 'game' | 'asset'
  target_id: string
  version: string
  title: string
  body: string
  file_url: string
  file_name: string
  file_size: string
  author_id?: string
  author_username?: string
  is_prerelease: boolean
  created_at: string
}
