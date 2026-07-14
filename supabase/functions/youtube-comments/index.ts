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
    const { videoId, maxResults = 20 } = await req.json()

    if (!videoId) {
      throw new Error("videoId is required")
    }

    const youtubeKey = Deno.env.get("YOUTUBE_API_KEY")
    if (!youtubeKey) {
      throw new Error("YOUTUBE_API_KEY not configured")
    }

    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${youtubeKey}`

    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`YouTube API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    const comments = (data.items || []).map((item: Record<string, unknown>) => {
      const snippet = item.snippet as Record<string, unknown>
      const topLevelComment = snippet?.topLevelComment as Record<string, unknown>
      const commentSnippet = topLevelComment?.snippet as Record<string, unknown>

      return {
        id: item.id,
        authorDisplayName: commentSnippet?.authorDisplayName || "",
        authorProfileImageUrl: commentSnippet?.authorProfileImageUrl || "",
        textDisplay: commentSnippet?.textDisplay || "",
        likeCount: parseInt(String(commentSnippet?.likeCount || "0")),
        publishedAt: commentSnippet?.publishedAt || "",
        updatedAt: commentSnippet?.updatedAt || "",
      }
    })

    return new Response(JSON.stringify({ comments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message, comments: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
