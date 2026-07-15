import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    const authHeader = req.headers.get("Authorization")!
    const token = authHeader.replace("Bearer ", "")

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: profile } = await userClient
      .from("profiles")
      .select("is_admin, username")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin && profile?.username !== "ByocefS") {
      throw new Error("Not authorized")
    }

    const adminClient = createClient(supabaseUrl, serviceKey)

    const body = await req.json()
    const { action } = body

    switch (action) {
      case "list_users": {
        const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 })
        if (error) throw error
        const userIds = data.users.map((u) => u.id)
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("*")
          .in("id", userIds)
        return new Response(JSON.stringify({ users: data.users, profiles: profiles || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "ban_user": {
        const { userId } = body
        const { error } = await adminClient.auth.admin.updateUserById(userId, { ban_duration: "none" })
        if (error) throw error
        await adminClient.from("profiles").update({ is_admin: false }).eq("id", userId)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "delete_user": {
        const { userId } = body
        await adminClient.from("profiles").delete().eq("id", userId)
        const { error } = await adminClient.auth.admin.deleteUser(userId)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "set_admin": {
        const { userId, isAdmin } = body
        const { error } = await adminClient
          .from("profiles")
          .update({ is_admin: isAdmin })
          .eq("id", userId)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "update_profile": {
        const { userId, data: profileData } = body
        const { error } = await adminClient
          .from("profiles")
          .update(profileData)
          .eq("id", userId)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "update_site_stats": {
        const { statName, value } = body
        const { error } = await adminClient
          .from("site_stats")
          .upsert({ key: statName, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "get_all_stats": {
        const tables = ["profiles", "experiences", "submissions", "assets", "messages", "ai_chats"]
        const counts: Record<string, number> = {}
        for (const table of tables) {
          const { count } = await adminClient.from(table).select("id", { count: "exact", head: true })
          counts[table] = count || 0
        }
        const { data: stats } = await adminClient.from("site_stats").select("*")
        return new Response(JSON.stringify({ counts, stats: stats || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "delete_submission": {
        const { id } = body
        const { error } = await adminClient.from("submissions").delete().eq("id", id)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "approve_submission": {
        const { id } = body
        const { data: sub, error: fetchErr } = await adminClient.from("submissions").select("*").eq("id", id).single()
        if (fetchErr) throw fetchErr
        await adminClient.from("experiences").insert({
          creator_id: sub.user_id,
          title: sub.title,
          description: sub.description,
          category: sub.category,
          price: sub.price || "Free",
          video_url: sub.video_url || "",
          game_url: sub.game_url || "",
          download_url: sub.drive_file_url || "",
          thumbnail_url: sub.thumbnail_url || "",
          images: sub.gallery_images || sub.screenshots_urls || [],
          gamepass_id: sub.gamepass_url || "",
          is_official: false,
          game_play: false,
          download_enabled: true,
        })
        await adminClient.from("submissions").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      case "reject_submission": {
        const { id, reason } = body
        const { error } = await adminClient
          .from("submissions")
          .update({ status: "rejected", rejection_reason: reason || "", reviewed_at: new Date().toISOString() })
          .eq("id", id)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      default:
        throw new Error("Unknown action: " + action)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
