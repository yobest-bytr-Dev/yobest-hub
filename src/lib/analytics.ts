import { supabase } from '@/config/supabase'

const LAST_VISIT_KEY = 'yobest_last_visit'

export async function trackVisit(): Promise<void> {
  const now = Date.now()
  const last = parseInt(localStorage.getItem(LAST_VISIT_KEY) || '0', 10)
  const hourMs = 60 * 60 * 1000
  if (now - last > hourMs) {
    localStorage.setItem(LAST_VISIT_KEY, String(now))
    try {
      await supabase.rpc('increment_stat', { p_key: 'visits' })
    } catch {}
  }
}

export async function trackDownload(_gameId?: string): Promise<void> {
  try {
    await supabase.rpc('increment_stat', { p_key: 'downloads' })
  } catch {}
}

export async function trackAssetDownload(assetId: string): Promise<void> {
  try {
    await supabase.rpc('increment_stat', { p_key: 'downloads' })
    await supabase.rpc('increment_asset_downloads', { p_asset_id: assetId })
  } catch {}
}

export async function trackExperienceDownload(expId: string): Promise<void> {
  try {
    await supabase.rpc('increment_stat', { p_key: 'downloads' })
    await supabase.rpc('increment_experience_downloads', { p_exp_id: expId })
  } catch {}
}

export async function trackToolDownload(toolId: string): Promise<void> {
  try {
    await supabase.rpc('increment_stat', { p_key: 'downloads' })
    await supabase.rpc('increment_tool_downloads', { p_tool_id: toolId })
  } catch {}
}

export async function trackAiSession(): Promise<void> {
  try {
    await supabase.rpc('increment_stat', { p_key: 'ai_sessions' })
  } catch {}
}

export async function trackGameView(gameId: string): Promise<void> {
  try {
    await supabase.rpc('track_game_view', { p_game_id: gameId })
  } catch {}
}

export async function getGameViewCount(gameId: string): Promise<number> {
  try {
    const { data } = await supabase.rpc('get_game_view_count', { p_game_id: gameId })
    return Number(data) || 0
  } catch {
    return 0
  }
}

export async function getGameViewCounts(gameIds: string[]): Promise<Map<string, number>> {
  try {
    const { data } = await supabase.rpc('get_game_view_counts', { p_game_ids: gameIds })
    const map = new Map<string, number>()
    if (data) {
      data.forEach((row: any) => map.set(row.game_id, Number(row.view_count) || 0))
    }
    return map
  } catch {
    return new Map()
  }
}

export async function getSiteAnalytics(): Promise<{ visitors: number; downloads: number; aiSessions: number }> {
  try {
    const { data, error } = await supabase
      .from('site_stats')
      .select('key, value')

    if (error || !data) return { visitors: 0, downloads: 0, aiSessions: 0 }

    const map = new Map(data.map((r: any) => [r.key, r.value]))
    return {
      visitors: map.get('visits') || 0,
      downloads: map.get('downloads') || 0,
      aiSessions: map.get('ai_sessions') || 0,
    }
  } catch {
    return { visitors: 0, downloads: 0, aiSessions: 0 }
  }
}
