import { supabase } from '@/config/supabase'

export async function toggleGameLike(gameId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count } = await supabase
    .from('game_likes')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId)
    .eq('user_id', user.id)

  if ((count || 0) > 0) {
    await supabase
      .from('game_likes')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', user.id)
    return false
  } else {
    await supabase
      .from('game_likes')
      .insert({ game_id: gameId, user_id: user.id })
    return true
  }
}

export async function getGameLikeCount(gameId: string): Promise<number> {
  const { count } = await supabase
    .from('game_likes')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId)
  return count || 0
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
    .select('*, profiles!game_comments_user_id_fkey(username, avatar_url, roblox_id)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return []
  return data || []
}
