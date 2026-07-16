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

    // Fetch gamepass info using the Roblox marketplace API
    let gamepassInfo: any = null
    let exists = false

    try {
      const gpRes = await fetch(
        `https://api.roblox.com/marketplace/game-pass-product-info?gamePassId=${gpId}`,
        { headers: { "Accept": "application/json" } }
      )
      if (gpRes.ok) {
        const data = await gpRes.json()
        if (data && data.Name) {
          exists = true
          gamepassInfo = {
            name: data.Name,
            price: data.PriceInRobux ?? null,
            description: data.Description ?? "",
            isForSale: data.IsForSale ?? false,
          }
        }
      }
    } catch {}

    // Fallback: try the newer API
    if (!exists) {
      try {
        const gpRes2 = await fetch(
          `https://apis.roblox.com/game-passes/v1/game-passes/${gpId}`,
          { headers: { "Accept": "application/json" } }
        )
        if (gpRes2.ok) {
          const data2 = await gpRes2.json()
          if (data2 && data2.name) {
            exists = true
            gamepassInfo = {
              name: data2.name,
              price: null,
              description: data2.description ?? "",
              isForSale: data2.isForSale ?? false,
            }
          }
        }
      } catch {}
    }

    const price = gamepassInfo?.price ?? null
    const name = gamepassInfo?.name ?? null

    // If we have a user ID, verify ownership
    let verified = false
    if (roblox_user_id && exists) {
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
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
