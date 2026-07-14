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
    const { username } = await req.json()

    if (!username || username.length < 3) {
      throw new Error("Invalid username")
    }

    const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username] }),
    })

    if (!userResponse.ok) {
      throw new Error(`Roblox API error: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    if (!userData.data || userData.data.length === 0) {
      return new Response(
        JSON.stringify({ found: false, error: "User not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const robloxUser = userData.data[0]

    let avatarUrl = `https://ui-avatars.com/api/?name=${robloxUser.name[0]}&background=3b82f6&color=fff&bold=true&size=150`

    try {
      const thumbResponse = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUser.id}&size=150x150&format=Png&isCircular=false`
      )
      if (thumbResponse.ok) {
        const thumbData = await thumbResponse.json()
        if (thumbData.data && thumbData.data.length > 0 && thumbData.data[0].imageUrl) {
          avatarUrl = thumbData.data[0].imageUrl
        }
      }
    } catch {
      // keep fallback avatar
    }

    return new Response(
      JSON.stringify({
        found: true,
        userId: robloxUser.id,
        username: robloxUser.name,
        displayName: robloxUser.displayName,
        avatarUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ found: false, error: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
