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
    const url = new URL(req.url)
    const userIds = url.searchParams.get("userIds")
    const size = url.searchParams.get("size") || "150x150"

    if (!userIds) {
      throw new Error("Missing userIds parameter")
    }

    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=${size}&format=Png&isCircular=true`
    )

    if (!thumbRes.ok) {
      throw new Error(`Roblox API error: ${thumbRes.status}`)
    }

    const thumbData = await thumbRes.json()
    const results: Record<string, string> = {}

    if (thumbData.data && Array.isArray(thumbData.data)) {
      for (const item of thumbData.data) {
        if (item.targetId && item.imageUrl) {
          results[String(item.targetId)] = item.imageUrl
        }
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
