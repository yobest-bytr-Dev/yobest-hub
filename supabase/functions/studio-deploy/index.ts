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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method === "POST") {
      // Website sends code to inject
      const { token, code, name } = await req.json()
      if (!token || !code) {
        return new Response(JSON.stringify({ error: "token and code required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { error } = await supabase.from("studio_queue").insert({
        token,
        code,
        script_name: name || "YobestAI_Script",
        status: "pending",
      })

      if (error) throw error

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (req.method === "GET") {
      // Plugin polls for pending code
      const url = new URL(req.url)
      const token = url.searchParams.get("token")
      if (!token) {
        return new Response(JSON.stringify({ error: "token required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { data, error } = await supabase
        .from("studio_queue")
        .select("id, code, script_name")
        .eq("token", token)
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        // Mark as delivered
        await supabase
          .from("studio_queue")
          .update({ status: "delivered" })
          .eq("id", data.id)
      }

      return new Response(JSON.stringify(data || { idle: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
