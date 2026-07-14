import { useState, useEffect, useCallback } from 'react'

interface YouTubeStats {
  id: string
  title: string
  thumbnailUrl: string
  viewCount: number
  likeCount: number
  duration: string
  publishedAt: string
  channelTitle: string
}

interface UseYouTubeStatsReturn {
  stats: Record<string, YouTubeStats>
  loading: boolean
  error: string | null
}

export function useYouTubeStats(videoIds: string[]): UseYouTubeStatsReturn {
  const [stats, setStats] = useState<Record<string, YouTubeStats>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (videoIds.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const uniqueIds = [...new Set(videoIds.filter(Boolean))]
      if (uniqueIds.length === 0) return

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Fallback: use YouTube oEmbed for basic info
        const fallbackStats: Record<string, YouTubeStats> = {}
        for (const id of uniqueIds) {
          try {
            const res = await fetch(
              `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`
            )
            if (res.ok) {
              const data = await res.json()
              fallbackStats[id] = {
                id,
                title: data.title || '',
                thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
                viewCount: 0,
                likeCount: 0,
                duration: '',
                publishedAt: '',
                channelTitle: data.author_name || '',
              }
            }
          } catch {
            // skip failed fetches
          }
        }
        setStats(fallbackStats)
        setLoading(false)
        return
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/youtube-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ videoIds: uniqueIds }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch YouTube stats: ${response.status}`)
      }

      const data = await response.json()
      const statsMap: Record<string, YouTubeStats> = {}

      for (const item of data.items || []) {
        statsMap[item.id] = item
      }

      setStats(statsMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [videoIds.join(',')])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error }
}
