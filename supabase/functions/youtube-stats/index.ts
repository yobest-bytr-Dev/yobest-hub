import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { videoIds } = await req.json()

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      throw new Error("videoIds must be a non-empty array")
    }

    const youtubeKey = Deno.env.get("YOUTUBE_API_KEY")
    if (!youtubeKey) {
      throw new Error("YOUTUBE_API_KEY not configured")
    }

    const ids = videoIds.slice(0, 50).join(",")
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${youtubeKey}`

    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`YouTube API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    const results = (data.items || []).map((item: Record<string, unknown>) => {
      const snippet = item.snippet as Record<string, unknown>
      const statistics = item.statistics as Record<string, string>
      const contentDetails = item.contentDetails as Record<string, string>

      return {
        id: item.id,
        title: snippet?.title,
        description: snippet?.description,
        thumbnailUrl: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url,
        publishedAt: snippet?.publishedAt,
        channelTitle: snippet?.channelTitle,
        viewCount: parseInt(statistics?.viewCount || "0"),
        likeCount: parseInt(statistics?.likeCount || "0"),
        commentCount: parseInt(statistics?.commentCount || "0"),
        duration: contentDetails?.duration,
      }
    })

    return new Response(JSON.stringify({ items: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
