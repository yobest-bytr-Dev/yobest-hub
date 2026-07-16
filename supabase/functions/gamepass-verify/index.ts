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

    if (!gamepass_id || !roblox_user_id) {
      throw new Error("gamepass_id and roblox_user_id are required")
    }

    const gpId = String(gamepass_id).trim()
    const userId = String(roblox_user_id).trim()

    // Check Roblox inventory for gamepass ownership
    const invResponse = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gpId}`,
      { headers: { "Accept": "application/json" } }
    )

    if (invResponse.ok) {
      const invData = await invResponse.json()
      if (invData.data && invData.data.length > 0) {
        return new Response(
          JSON.stringify({ verified: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    // Fallback: check via gamepass info API to verify the gamepass exists
    const gpResponse = await fetch(
      `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${gpId}`,
      { headers: { "Accept": "application/json" } }
    ).catch(() => null)

    return new Response(
      JSON.stringify({ verified: false, error: "Gamepass not found in inventory" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ verified: false, error: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
