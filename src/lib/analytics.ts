import { supabase } from '@/config/supabase'

const LAST_VISIT_KEY = 'yobest_last_visit'
const GAME_VIEWS_KEY = 'yobest_game_views'

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

export function trackGameView(gameId: string): void {
  try {
    const views = JSON.parse(localStorage.getItem(GAME_VIEWS_KEY) || '{}')
    if (!views[gameId]) views[gameId] = 0
    views[gameId]++
    localStorage.setItem(GAME_VIEWS_KEY, JSON.stringify(views))
  } catch {}
}

export function getGameViewCount(gameId: string): number {
  try {
    const views = JSON.parse(localStorage.getItem(GAME_VIEWS_KEY) || '{}')
    return views[gameId] || 0
  } catch {
    return 0
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
