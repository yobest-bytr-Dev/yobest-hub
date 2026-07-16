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
    const { gamepass_id, roblox_user_id } = await req.json()

    if (!gamepass_id) {
      throw new Error("gamepass_id is required")
    }

    const gpId = String(gamepass_id).trim()

    // Fetch gamepass info from Roblox API to get name and price
    let gamepassInfo: any = null
    try {
      const gpRes = await fetch(
        `https://apis.roblox.com/game-passes/v1/game-passes/${gpId}`,
        { headers: { "Accept": "application/json" } }
      )
      if (gpRes.ok) {
        gamepassInfo = await gpRes.json()
      }
    } catch {}

    const price = gamepassInfo?.price ?? null
    const name = gamepassInfo?.name ?? null

    // If we have a user ID, verify ownership
    let verified = false
    if (roblox_user_id) {
      const userId = String(roblox_user_id).trim()
      try {
        const invResponse = await fetch(
          `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gpId}`,
          { headers: { "Accept": "application/json" } }
        )
        if (invResponse.ok) {
          const invData = await invResponse.json()
          if (invData.data && invData.data.length > 0) {
            verified = true
          }
        }
      } catch {}
    }

    return new Response(
      JSON.stringify({ verified, price, name, exists: !!gamepassInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ verified: false, price: null, name: null, exists: false, error: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
