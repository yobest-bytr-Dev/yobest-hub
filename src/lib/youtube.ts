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

  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  const hasRealKey = key && key !== 'your_youtube_api_key'

  if (hasRealKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${key}`
      )
      if (res.ok) {
        const data = await res.json()
        const item = data.items?.[0]
        if (item) {
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
        }
      }
    } catch {}
  }

  try {
    const [votesRes, oembedRes] = await Promise.allSettled([
      fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`),
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`),
    ])

    let viewCount = 0
    let likeCount = 0
    let commentCount = 0
    let title = ''
    let channelTitle = ''

    if (votesRes.status === 'fulfilled' && votesRes.value.ok) {
      const votes = await votesRes.value.json()
      viewCount = votes.viewCount || 0
      likeCount = votes.likes || 0
      commentCount = 0
    }

    if (oembedRes.status === 'fulfilled' && oembedRes.value.ok) {
      const oembed = await oembedRes.value.json()
      title = oembed.title || ''
      channelTitle = oembed.author_name || ''
    }

    if (viewCount > 0 || title) {
      const stats: YouTubeStats = { viewCount, likeCount, commentCount, title, channelTitle, publishedAt: '' }
      cache.set(videoId, stats)
      return stats
    }
  } catch {}

  return null
}

export async function getYouTubeStatsBatch(videoIds: string[]): Promise<Map<string, YouTubeStats>> {
  const results = new Map<string, YouTubeStats>()
  const uncached = videoIds.filter((id) => {
    const cached = cache.get(id)
    if (cached) results.set(id, cached)
    return !cached
  })

  if (uncached.length === 0) return results

  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  const hasRealKey = key && key !== 'your_youtube_api_key'

  if (hasRealKey) {
    try {
      const ids = uncached.slice(0, 50).join(',')
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${key}`
      )
      if (res.ok) {
        const data = await res.json()
        for (const item of data.items || []) {
          const stats: YouTubeStats = {
            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
            likeCount: parseInt(item.statistics?.likeCount || '0', 10),
            commentCount: parseInt(item.statistics?.commentCount || '0', 10),
            title: item.snippet?.title || '',
            channelTitle: item.snippet?.channelTitle || '',
            publishedAt: item.snippet?.publishedAt || '',
          }
          results.set(item.id, stats)
          cache.set(item.id, stats)
        }
        return results
      }
    } catch {}
  }

  const promises = uncached.map(async (videoId) => {
    try {
      const [votesRes, oembedRes] = await Promise.allSettled([
        fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`),
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`),
      ])

      let viewCount = 0, likeCount = 0, commentCount = 0, title = '', channelTitle = ''

      if (votesRes.status === 'fulfilled' && votesRes.value.ok) {
        const votes = await votesRes.value.json()
        viewCount = votes.viewCount || 0
        likeCount = votes.likes || 0
      }

      if (oembedRes.status === 'fulfilled' && oembedRes.value.ok) {
        const oembed = await oembedRes.value.json()
        title = oembed.title || ''
        channelTitle = oembed.author_name || ''
      }

      if (viewCount > 0 || title) {
        const stats: YouTubeStats = { viewCount, likeCount, commentCount, title, channelTitle, publishedAt: '' }
        results.set(videoId, stats)
        cache.set(videoId, stats)
      }
    } catch {}
  })

  await Promise.allSettled(promises)
  return results
}

export async function getYouTubeComments(videoId: string, maxResults = 20): Promise<YouTubeComment[]> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  const hasRealKey = key && key !== 'your_youtube_api_key'

  if (hasRealKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${key}`
      )
      if (res.ok) {
        const data = await res.json()
        return (data.items || []).map((item: any) => {
          const s = item.snippet?.topLevelComment?.snippet
          return {
            id: item.id,
            authorDisplayName: s?.authorDisplayName || '',
            authorProfileImageUrl: s?.authorProfileImageUrl || '',
            textDisplay: s?.textDisplay || '',
            likeCount: parseInt(s?.likeCount || '0', 10),
            publishedAt: s?.publishedAt || '',
            updatedAt: s?.updatedAt || '',
          }
        })
      }
    } catch {}
  }

  return []
}
