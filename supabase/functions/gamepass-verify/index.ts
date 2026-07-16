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

    if (!/^\d+$/.test(gpId)) {
      return new Response(
        JSON.stringify({ verified: false, exists: false, price: null, name: null, error: "Gamepass ID must be a number" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let exists = false
    let price: number | null = null
    let name: string | null = null

    const apiUrls = [
      `https://apis.roblox.com/game-passes/v1/game-passes/${gpId}/product-info`,
      `https://apis.roblox.com/game-passes/v1/game-passes/${gpId}/details`,
      `https://economy.roblox.com/v1/game-passes/${gpId}`,
    ]

    for (const url of apiUrls) {
      if (exists) break
      try {
        const res = await fetch(url, { headers: { "Accept": "application/json" } })
        if (!res.ok) continue
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          const item = data[0]
          if (item.name || item.Name) {
            exists = true
            name = item.name || item.Name
            price = item.priceInRobux ?? item.PriceInRobux ?? null
          }
        } else if (data && (data.name || data.Name)) {
          exists = true
          name = data.name || data.Name
          price = data.priceInRobux ?? data.PriceInRobux ?? null
        } else if (data && data.TargetId) {
          exists = true
          name = data.Name || null
          price = data.PriceInRobux ?? null
        }
      } catch {}
    }

    if (!exists) {
      return new Response(
        JSON.stringify({ verified: false, exists: false, price: null, name: null, error: "Could not verify gamepass" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

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
      JSON.stringify({ verified, price, name, exists }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ verified: false, price: null, name: null, exists: false, error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
