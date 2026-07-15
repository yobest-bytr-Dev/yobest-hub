import { supabase } from '@/config/supabase'
import type { Experience, Asset, UserProfile, Challenge, Submission } from './types'

export async function signUp(
  email: string,
  password: string,
  robloxUsername: string,
  robloxUserId: number,
  robloxAvatarUrl: string
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey && supabaseKey !== 'placeholder-key') {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          data: { roblox_username: robloxUsername, roblox_user_id: robloxUserId },
        }),
      })
      const body = await res.json()
      console.log('Direct signup response:', res.status, JSON.stringify(body))

      if (!res.ok) {
        const msg = body.error_description || body.msg || body.message || body.error || JSON.stringify(body)
        throw new Error(msg)
      }

      if (body.user) {
        supabase.from('profiles').upsert({
          id: body.user.id,
          username: robloxUsername,
          display_name: robloxUsername,
          avatar_url: robloxAvatarUrl,
          roblox_id: String(robloxUserId),
        }, { onConflict: 'id' }).then(({ error: profileError }) => {
          if (profileError) console.warn('Profile upsert (non-fatal):', profileError.message)
        })
      }
      return body
    } catch (e) {
      if (e instanceof TypeError && e.message.includes('fetch')) {
        // Network error, fall through to SDK
      } else {
        throw e
      }
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { roblox_username: robloxUsername, roblox_user_id: robloxUserId } },
  })
  if (error) {
    console.error('Supabase signUp error:', JSON.stringify(error))
    const msg = error.message || JSON.stringify(error) || 'Account creation failed'
    throw new Error(msg)
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      username: robloxUsername,
      display_name: robloxUsername,
      avatar_url: robloxAvatarUrl,
      roblox_id: String(robloxUserId),
    }, { onConflict: 'id' })
    if (profileError) {
      console.warn('Profile upsert failed (non-fatal):', profileError.message)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(error.message || 'Sign in failed')
  }
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data as UserProfile
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const meta = user.user_metadata || {}
  const metaRobloxId = meta.roblox_user_id ? String(meta.roblox_user_id) : null
  const metaRobloxUsername = meta.roblox_username || null

  let profile = await getProfile(user.id)

  if (profile) {
    if (!profile.roblox_id && metaRobloxId) {
      profile.roblox_id = metaRobloxId
      supabase.from('profiles').upsert({
        id: user.id,
        roblox_id: metaRobloxId,
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('Backfill roblox_id (non-fatal):', error.message)
      })
    }
    if (!profile.username && metaRobloxUsername) {
      profile.username = metaRobloxUsername
    }
    return profile
  }

  const robloxUsername = metaRobloxUsername || user.email?.split('@')[0] || 'User'

  const fallbackProfile: UserProfile = {
    id: user.id,
    username: robloxUsername,
    display_name: meta.display_name || robloxUsername,
    avatar_url: '',
    roblox_id: metaRobloxId || undefined,
    bio: meta.bio || '',
    followers_count: 0,
    following_count: 0,
    games_count: 0,
    is_admin: false,
    created_at: user.created_at || new Date().toISOString(),
  }

  supabase.from('profiles').upsert({
    id: user.id,
    username: robloxUsername,
    display_name: meta.display_name || robloxUsername,
    roblox_id: metaRobloxId || null,
    bio: meta.bio || '',
  }, { onConflict: 'id' }).then(({ error }) => {
    if (error) console.warn('Auto-create profile (non-fatal):', error.message)
  })

  return fallbackProfile
}

export async function getExperiences(options?: { official?: boolean; category?: string }): Promise<Experience[]> {
  let query = supabase.from('experiences').select('*')

  if (options?.official !== undefined) {
    query = query.eq('is_official', options.official)
  }
  if (options?.category && options.category !== 'All') {
    query = query.eq('category', options.category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as Experience[]
}

export async function getApprovedCommunityGames(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) return []

  return (data || []).map((s: Submission): Experience => ({
    id: s.id,
    creator: '',
    creator_id: s.user_id,
    title: s.title,
    description: s.description,
    video_url: s.video_url || '',
    download_url: s.drive_file_url || '',
    download_enabled: !!s.drive_file_url,
    game_url: s.game_url || '',
    game_play: !!s.game_url,
    price: s.price || 'Free',
    category: s.category,
    is_official: false,
    thumbnail_url: s.thumbnail_url || '',
    created_at: s.created_at,
  }))
}

export async function getAssets(options?: { type?: string }): Promise<Asset[]> {
  let query = supabase.from('assets').select('*')

  if (options?.type && options.type !== 'all') {
    query = query.eq('type', options.type)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as Asset[]
}

export async function getChallenges(status?: string): Promise<Challenge[]> {
  let query = supabase.from('challenges').select('*')

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('end_date', { ascending: false })
  if (error) return []
  return (data || []) as Challenge[]
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('games_count', { ascending: false })
    .limit(10)

  if (error) return []
  return (data || []) as UserProfile[]
}

export async function submitGame(submission: {
  title: string
  description: string
  category: string
  video_url?: string
  game_url?: string
  drive_file_url?: string
  gamepass_url?: string
  thumbnail_url?: string
  price?: string
  gallery_images?: string[]
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase.from('submissions').insert({
    user_id: user.id,
    title: submission.title,
    description: submission.description,
    category: submission.category,
    price: submission.price,
    video_url: submission.video_url,
    game_url: submission.game_url,
    drive_file_url: submission.drive_file_url,
    gamepass_url: submission.gamepass_url,
    thumbnail_url: submission.thumbnail_url,
    gallery_images: submission.gallery_images || [],
  }).select().single()

  if (error) throw error
  return data
}

export async function getSubmissions(): Promise<Submission[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data || []) as Submission[]
}

export async function getPlatformStats() {
  const fallback = { officialGames: 13, creators: 0, assets: 0, communityGames: 0 }

  try {
    const queries = [
      { key: 'officialGames', q: supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('is_official', true), fallback: 13 },
      { key: 'creators', q: supabase.from('profiles').select('id', { count: 'exact', head: true }), fallback: 0 },
      { key: 'assets', q: supabase.from('assets').select('id', { count: 'exact', head: true }), fallback: 0 },
      { key: 'communityGames', q: supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'approved'), fallback: 0 },
    ]

    const results = await Promise.allSettled(queries.map(({ q }) => q))

    const stats = { ...fallback }
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        stats[queries[i].key as keyof typeof stats] = (result.value.count || queries[i].fallback)
      }
    })

    return stats
  } catch {
    return fallback
  }
}

export async function saveAiChat(messages: unknown[], model: string, title: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase.from('ai_chats').upsert({
    user_id: user.id,
    model,
    title,
    messages,
    updated_at: new Date().toISOString(),
  }).select().single()

  if (error) throw error
  return data
}

export async function getAiChats() {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('ai_chats')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return []
  return data
}

// ── Messages (Supabase DB) ──

async function ensureProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).single()
  if (data) return
  const user = await getCurrentUser()
  if (!user || user.id !== userId) return
  const meta = user.user_metadata || {}
  await supabase.from('profiles').upsert({
    id: user.id,
    username: meta.roblox_username || user.email?.split('@')[0] || 'User',
    display_name: meta.roblox_username || user.email?.split('@')[0] || 'User',
    roblox_id: meta.roblox_user_id ? String(meta.roblox_user_id) : null,
  }, { onConflict: 'id' })
}

export async function sendDbMessage(receiverId: string, content: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  await ensureProfile(user.id)
  await ensureProfile(receiverId)
  const { data, error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  }).select().single()
  if (error) {
    console.error('sendDbMessage error:', error.message, error)
    throw new Error(`Failed to send: ${error.message}`)
  }
  return data
}

export async function fetchDbMessages() {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('fetchDbMessages error:', error.message)
    return []
  }
  return data || []
}

export async function markDbMessagesRead(otherUserId: string) {
  const user = await getCurrentUser()
  if (!user) return
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)
  if (error) console.error('markDbMessagesRead error:', error.message)
}

// ── Game Likes ──

export async function toggleGameLike(gameId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: existing } = await supabase
    .from('game_likes')
    .select('id')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (existing) {
    await supabase.from('game_likes').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('game_likes').insert({ game_id: gameId, user_id: user.id })
    return true
  }
}

export async function hasUserLikedGame(gameId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { count } = await supabase
    .from('game_likes')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId)
    .eq('user_id', user.id)
  return (count || 0) > 0
}

export async function getGameLikeCount(gameId: string): Promise<number> {
  const { count } = await supabase
    .from('game_likes')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId)
  return count || 0
}

// ── Game Comments ──

export async function addGameComment(gameId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('game_comments').insert({
    game_id: gameId,
    user_id: user.id,
    content,
  }).select().single()
  if (error) throw error
  return data
}

export async function getGameComments(gameId: string) {
  const { data, error } = await supabase
    .from('game_comments')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return []

  if (!data || data.length === 0) return []

  const userIds = [...new Set(data.map((c: any) => c.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, roblox_id')
    .in('id', userIds)
  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  return data.map((c: any) => ({
    ...c,
    profile: profileMap.get(c.user_id) || null,
  }))
}

export async function editGameComment(commentId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('game_comments')
    .update({ content })
    .eq('id', commentId)
    .eq('user_id', user.id)
  if (error) throw error
}

export async function deleteGameComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('game_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)
  if (error) throw error
}

// ── Asset Submission ──

export async function submitAsset(submission: {
  title: string
  description: string
  type: string
  price_robux: number
  drive_file_url?: string
  thumbnail_url?: string
  gamepass_id?: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('assets').insert({
    creator_id: user.id,
    ...submission,
  }).select().single()
  if (error) throw error
  return data
}

// ── Gamepass Verification ──

export async function verifyGamepassPurchase(gamepassId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  const { data } = await supabase
    .from('gamepass_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('gamepass_id', gamepassId)
    .eq('verified', true)
    .maybeSingle()
  return !!data
}

export async function recordGamepassPurchase(gamepassId: string, gameId?: string, assetId?: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  const { error } = await supabase.from('gamepass_purchases').upsert({
    user_id: user.id,
    gamepass_id: gamepassId,
    game_id: gameId || null,
    asset_id: assetId || null,
    verified: true,
  }, { onConflict: 'user_id,gamepass_id' })
  return !error
}

export function extractGamepassId(url: string): string | null {
  const match = url.match(/game-pass[\/?]([0-9]+)/)
  return match ? match[1] : null
}

// ── Owner Dashboard CRUD ──

export async function getOwnerExperiences(): Promise<Experience[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as Experience[]
}

export async function getOwnerSubmissions(): Promise<Submission[]> {
  return getSubmissions()
}

export async function updateExperience(id: string, updates: Partial<Experience>) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('experiences')
    .update({
      title: updates.title,
      description: updates.description,
      category: updates.category,
      price: updates.price,
      video_url: updates.video_url,
      game_url: updates.game_url,
      download_url: updates.download_url,
      thumbnail_url: updates.thumbnail_url,
      download_enabled: updates.download_enabled,
      game_play: updates.game_play,
    })
    .eq('id', id)
    .eq('creator_id', user.id)
  if (error) throw error
}

export async function deleteExperience(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id)
  if (error) throw error
}

export async function updateAsset(id: string, updates: Partial<Asset>) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('assets')
    .update({
      title: updates.title,
      description: updates.description,
      type: updates.type,
      price_robux: updates.price_robux,
      drive_file_url: updates.drive_file_url,
      thumbnail_url: updates.thumbnail_url,
      gamepass_id: updates.gamepass_id,
    })
    .eq('id', id)
    .eq('creator_id', user.id)
  if (error) throw error
}

export async function deleteAsset(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id)
  if (error) throw error
}

export async function updateSubmission(id: string, updates: Partial<Submission>) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('submissions')
    .update({
      title: updates.title,
      description: updates.description,
      category: updates.category,
      price: updates.price,
      video_url: updates.video_url,
      game_url: updates.game_url,
      drive_file_url: updates.drive_file_url,
      thumbnail_url: updates.thumbnail_url,
    })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw error
}

export async function deleteSubmission(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw error
}
