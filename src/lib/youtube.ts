export interface YouTubeStats {
  viewCount: number
  likeCount: number
  commentCount: number
  title: string
  channelTitle: string
  publishedAt: string
}

export interface YouTubeComment {
  id: string
  authorDisplayName: string
  authorProfileImageUrl: string
  textDisplay: string
  likeCount: number
  publishedAt: string
  updatedAt: string
}

const cache = new Map<string, YouTubeStats>()

export async function getYouTubeStats(videoId: string): Promise<YouTubeStats | null> {
  if (cache.has(videoId)) return cache.get(videoId)!

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      const res = await fetch(`${supabaseUrl}/functions/v1/youtube-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ videoIds: [videoId] }),
      })

      if (res.ok) {
        const data = await res.json()
        const item = data.items?.[0]
        if (item) {
          const stats: YouTubeStats = {
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            commentCount: item.commentCount || 0,
            title: item.title || '',
            channelTitle: item.channelTitle || '',
            publishedAt: item.publishedAt || '',
          }
          cache.set(videoId, stats)
          return stats
        }
      }
    }

    return getYouTubeStatsDirect(videoId)
  } catch {
    return getYouTubeStatsDirect(videoId)
  }
}

export async function getYouTubeStatsBatch(videoIds: string[]): Promise<Map<string, YouTubeStats>> {
  const results = new Map<string, YouTubeStats>()
  const uncached = videoIds.filter((id) => {
    const cached = cache.get(id)
    if (cached) results.set(id, cached)
    return !cached
  })

  if (uncached.length === 0) return results

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      const res = await fetch(`${supabaseUrl}/functions/v1/youtube-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ videoIds: uncached }),
      })

      if (res.ok) {
        const data = await res.json()
        for (const item of data.items || []) {
          const stats: YouTubeStats = {
            viewCount: item.viewCount || 0,
            likeCount: item.likeCount || 0,
            commentCount: item.commentCount || 0,
            title: item.title || '',
            channelTitle: item.channelTitle || '',
            publishedAt: item.publishedAt || '',
          }
          results.set(item.id, stats)
          cache.set(item.id, stats)
        }
      }
    }
  } catch {
    // fallback: fetch individually via direct API
  }

  return results
}

async function getYouTubeStatsDirect(videoId: string): Promise<YouTubeStats | null> {
  try {
    const key = import.meta.env.VITE_YOUTUBE_API_KEY
    if (!key || key === 'your_youtube_api_key') return null

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${key}`
    )
    if (!res.ok) return null

    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null

    const stats: YouTubeStats = {
      viewCount: parseInt(item.statistics?.viewCount || '0', 10),
      likeCount: parseInt(item.statistics?.likeCount || '0', 10),
      commentCount: parseInt(item.statistics?.commentCount || '0', 10),
      title: item.snippet?.title || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
    }
    cache.set(videoId, stats)
    return stats
  } catch {
    return null
  }
}

export async function getYouTubeComments(videoId: string, maxResults = 20): Promise<YouTubeComment[]> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      const res = await fetch(`${supabaseUrl}/functions/v1/youtube-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ videoId, maxResults }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.comments || []
      }
    }

    return getYouTubeCommentsDirect(videoId, maxResults)
  } catch {
    return getYouTubeCommentsDirect(videoId, maxResults)
  }
}

async function getYouTubeCommentsDirect(videoId: string, maxResults = 20): Promise<YouTubeComment[]> {
  try {
    const key = import.meta.env.VITE_YOUTUBE_API_KEY
    if (!key || key === 'your_youtube_api_key') return []

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${key}`
    )
    if (!res.ok) return []

    const data = await res.json()
    return (data.items || []).map((item: any) => {
      const snippet = item.snippet?.topLevelComment?.snippet
      return {
        id: item.id,
        authorDisplayName: snippet?.authorDisplayName || '',
        authorProfileImageUrl: snippet?.authorProfileImageUrl || '',
        textDisplay: snippet?.textDisplay || '',
        likeCount: parseInt(snippet?.likeCount || '0', 10),
        publishedAt: snippet?.publishedAt || '',
        updatedAt: snippet?.updatedAt || '',
      }
    })
  } catch {
    return []
  }
}
