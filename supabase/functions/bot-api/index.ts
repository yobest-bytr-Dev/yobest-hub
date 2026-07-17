import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action } = body;

    const authHeader = req.headers.get("Authorization") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: profile } = await sb.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let result: any = {};

    switch (action) {
      case "get_bot_status": {
        const { data: hb } = await sb.from("bot_heartbeat").select("ts").order("ts", { ascending: false }).limit(1).maybeSingle();
        const { data: config } = await sb.from("bot_config").select("key, value").order("key");
        const { count: pendingCmds } = await sb.from("web_commands").select("*", { count: "exact", head: true }).eq("status", "pending");
        const { count: executedCmds } = await sb.from("web_commands").select("*", { count: "exact", head: true }).eq("status", "executed");
        const { count: failedCmds } = await sb.from("web_commands").select("*", { count: "exact", head: true }).eq("status", "failed");
        const { count: guildCount } = await sb.from("bot_guilds").select("*", { count: "exact", head: true });
        const { data: guilds } = await sb.from("bot_guilds").select("guild_id, name, icon_url, member_count, boost_level, channels").order("member_count", { ascending: false });

        const lastHb = hb?.ts ? new Date(hb.ts).getTime() : 0;
        const isOnline = Date.now() - lastHb < 90_000;

        result = {
          is_online: isOnline,
          last_heartbeat: hb?.ts || null,
          config: config || [],
          stats: {
            pending_commands: pendingCmds || 0,
            executed_commands: executedCmds || 0,
            failed_commands: failedCmds || 0,
            guild_count: guildCount || 0,
          },
          guilds: (guilds || []).map((g: any) => ({
            ...g,
            channels: typeof g.channels === 'string' ? JSON.parse(g.channels) : (g.channels || []),
          })),
        };
        break;
      }

      case "update_config": {
        const { key, value } = body;
        if (!key || value === undefined) return new Response(JSON.stringify({ error: "key and value required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        await sb.from("bot_config").upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
        result = { success: true };
        break;
      }

      case "send_command": {
        const { guild_id, command, payload } = body;
        if (!guild_id || !command) return new Response(JSON.stringify({ error: "guild_id and command required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data, error } = await sb.from("web_commands").insert({
          guild_id, command, payload: payload || {}, status: "pending",
        }).select().single();
        if (error) throw error;
        result = { success: true, id: data.id };
        break;
      }

      case "post_news": {
        const { guild_id, channel_id, title, description, game_url, image_url } = body;
        if (!guild_id || !title) return new Response(JSON.stringify({ error: "guild_id and title required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const payload: any = { title, description: description || "" };
        if (channel_id) payload.channel_id = channel_id;
        if (game_url) payload.game_url = game_url;
        if (image_url) payload.image_url = image_url;
        const { data, error } = await sb.from("web_commands").insert({
          guild_id, command: "post_news", payload, status: "pending",
        }).select().single();
        if (error) throw error;
        result = { success: true, id: data.id };
        break;
      }

      case "get_command_history": {
        const { data: cmds } = await sb.from("web_commands")
          .select("id, guild_id, command, payload, status, result, created_at, executed_at")
          .order("created_at", { ascending: false }).limit(50);
        result = { commands: cmds || [] };
        break;
      }

      case "get_guild_settings": {
        const { guild_id } = body;
        if (!guild_id) return new Response(JSON.stringify({ error: "guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data } = await sb.from("bot_guild_settings").select("*").eq("guild_id", guild_id).maybeSingle();
        result = { settings: data || null };
        break;
      }

      case "save_guild_settings": {
        const { guild_id, settings } = body;
        if (!guild_id || !settings) return new Response(JSON.stringify({ error: "guild_id and settings required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        await sb.from("bot_guild_settings").upsert({
          guild_id, ...settings, updated_at: new Date().toISOString(),
        });
        // Tell the bot to reload settings
        await sb.from("web_commands").insert({
          guild_id, command: "reload_settings", payload: {}, status: "pending",
        });
        result = { success: true };
        break;
      }

      case "save_guild_channel": {
        const { guild_id, channel_name, channel_id } = body;
        if (!guild_id || !channel_name) return new Response(JSON.stringify({ error: "guild_id and channel_name required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const settings: any = { updated_at: new Date().toISOString() };
        settings[channel_name] = channel_id || null;
        const { error } = await sb.from("bot_guild_settings").upsert({
          guild_id, ...settings,
        }, { onConflict: 'guild_id' });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "test_welcome": {
        const { guild_id } = body;
        if (!guild_id) return new Response(JSON.stringify({ error: "guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { error } = await sb.from("web_commands").insert({
          guild_id, command: "test_welcome", payload: {}, status: "pending",
        });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "sync_guilds": {
        const { error } = await sb.from("web_commands").insert({
          guild_id: body.guild_id || "*", command: "snapshot_stats", payload: {}, status: "pending",
        });
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
