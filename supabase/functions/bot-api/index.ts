import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function toDirectImageUrl(url: string): string {
  if (!url) return "";
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w800`;
  const idParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam) return `https://lh3.googleusercontent.com/d/${idParam[1]}=w800`;
  return url;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function resolveGameThumb(item: any): string {
  if (item.thumbnail_url) return toDirectImageUrl(item.thumbnail_url);
  const ytId = extractYoutubeId(item.video_url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  if (item.download_url && /\.(jpg|jpeg|png|gif|webp|drive|google)/i.test(item.download_url)) return toDirectImageUrl(item.download_url);
  return "";
}

const BOT_COMMANDS = [
  { name: "ping", description: "Check bot latency", category: "utility", defaultLevel: "member" },
  { name: "stats", description: "Bot and server stats", category: "utility", defaultLevel: "member" },
  { name: "serverinfo", description: "Info about this server", category: "utility", defaultLevel: "member" },
  { name: "servericon", description: "Show the server icon", category: "utility", defaultLevel: "member" },
  { name: "botinfo", description: "Detailed bot information", category: "utility", defaultLevel: "member" },
  { name: "userinfo", description: "Info about a user", category: "utility", defaultLevel: "member" },
  { name: "avatar", description: "Show someone's avatar", category: "utility", defaultLevel: "member" },
  { name: "help", description: "Show all commands", category: "utility", defaultLevel: "member" },
  { name: "roll", description: "Roll dice (NdS format)", category: "fun", defaultLevel: "member" },
  { name: "coinflip", description: "Flip a coin", category: "fun", defaultLevel: "member" },
  { name: "rps", description: "Rock Paper Scissors vs bot", category: "fun", defaultLevel: "member" },
  { name: "8ball", description: "Magic 8-ball", category: "fun", defaultLevel: "member" },
  { name: "quote", description: "Random motivational quote", category: "fun", defaultLevel: "member" },
  { name: "math", description: "Evaluate math expression", category: "fun", defaultLevel: "member" },
  { name: "suggest", description: "Submit a suggestion", category: "engagement", defaultLevel: "member" },
  { name: "poll", description: "Create a poll", category: "engagement", defaultLevel: "member" },
  { name: "report", description: "Report a user to admins", category: "engagement", defaultLevel: "member" },
  { name: "remindme", description: "Set a reminder (DM)", category: "engagement", defaultLevel: "member" },
  { name: "site", description: "Show Yobest Studio website", category: "engagement", defaultLevel: "member" },
  { name: "discord", description: "Get the Discord invite link", category: "engagement", defaultLevel: "member" },
  { name: "rank", description: "Show your XP rank", category: "xp", defaultLevel: "member" },
  { name: "leaderboard", description: "Top 10 XP leaderboard", category: "xp", defaultLevel: "member" },
  { name: "ticket", description: "Open a support ticket", category: "tickets", defaultLevel: "member" },
  { name: "closeticket", description: "Close this support ticket", category: "tickets", defaultLevel: "mod" },
  { name: "snipe", description: "Show last deleted message", category: "utility", defaultLevel: "member" },
  { name: "aiforget", description: "Clear AI chat memory in channel", category: "ai", defaultLevel: "member" },
  { name: "enableai", description: "Enable AI in this channel", category: "ai", defaultLevel: "admin" },
  { name: "disableai", description: "Disable AI in this channel", category: "ai", defaultLevel: "admin" },
  { name: "generate", description: "AI Server Builder - generate layout", category: "ai", defaultLevel: "admin" },
  { name: "agent", description: "AI Server Agent - edit with NL", category: "ai", defaultLevel: "owner" },
  { name: "agentclear", description: "Clear AI agent session", category: "ai", defaultLevel: "owner" },
  { name: "command", description: "Talk to bot in plain language", category: "ai", defaultLevel: "owner" },
  { name: "warn", description: "Warn a user", category: "moderation", defaultLevel: "mod" },
  { name: "warnings", description: "View warnings for a user", category: "moderation", defaultLevel: "mod" },
  { name: "clearwarnings", description: "Clear all warnings", category: "moderation", defaultLevel: "mod" },
  { name: "mute", description: "Timeout a user", category: "moderation", defaultLevel: "mod" },
  { name: "unmute", description: "Remove timeout", category: "moderation", defaultLevel: "mod" },
  { name: "purge", description: "Delete 1-100 messages", category: "moderation", defaultLevel: "mod" },
  { name: "slowmode", description: "Set channel slowmode", category: "moderation", defaultLevel: "mod" },
  { name: "lock", description: "Lock this channel", category: "moderation", defaultLevel: "mod" },
  { name: "unlock", description: "Unlock this channel", category: "moderation", defaultLevel: "mod" },
  { name: "setnickname", description: "Change nickname", category: "moderation", defaultLevel: "mod" },
  { name: "ban", description: "Ban a user", category: "moderation", defaultLevel: "admin" },
  { name: "kick", description: "Kick a user", category: "moderation", defaultLevel: "admin" },
  { name: "announce", description: "Post announcement", category: "admin", defaultLevel: "admin" },
  { name: "giveaway", description: "Start a giveaway", category: "admin", defaultLevel: "admin" },
  { name: "settings", description: "Consolidated config command", category: "admin", defaultLevel: "admin" },
  { name: "ticketpanel", description: "Post ticket button panel", category: "admin", defaultLevel: "admin" },
  { name: "addcmd", description: "Add custom command", category: "admin", defaultLevel: "admin" },
  { name: "removecmd", description: "Remove custom command", category: "admin", defaultLevel: "admin" },
  { name: "listcmds", description: "List all custom commands", category: "admin", defaultLevel: "admin" },
  { name: "reactionrole", description: "Set up reaction role", category: "admin", defaultLevel: "admin" },
  { name: "clearxp", description: "Reset XP for a user", category: "admin", defaultLevel: "admin" },
  { name: "announcescript", description: "Post script announcement", category: "admin", defaultLevel: "admin" },
  { name: "roblox", description: "Roblox version tracker", category: "roblox", defaultLevel: "admin" },
  { name: "addgame", description: "Add game to catalog", category: "games", defaultLevel: "admin" },
  { name: "removegame", description: "Remove game from catalog", category: "games", defaultLevel: "admin" },
  { name: "listgames", description: "List all games", category: "games", defaultLevel: "member" },
  { name: "sharegame", description: "Share game in channel", category: "games", defaultLevel: "member" },
  { name: "announcegame", description: "Post game announcement", category: "games", defaultLevel: "admin" },
  { name: "games", description: "Browse game catalog", category: "games", defaultLevel: "member" },
  { name: "searchgame", description: "Search catalog by keyword", category: "games", defaultLevel: "member" },
  { name: "scanandclean", description: "Scan and clean messages", category: "owner", defaultLevel: "owner" },
  { name: "testautomod", description: "Test the auto-mod pipeline", category: "owner", defaultLevel: "owner" },
  { name: "aitest", description: "Test AI connection", category: "owner", defaultLevel: "owner" },
];

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
        const { data: guilds } = await sb.from("bot_guilds").select("guild_id, name, icon_url, member_count, boost_level, channels, categories, roles").order("member_count", { ascending: false });

        const lastHb = hb?.ts ? new Date(hb.ts).getTime() : 0;
        const isOnline = Date.now() - lastHb < 90_000;

        const configMap: Record<string, string> = {};
        (config || []).forEach((c: any) => { configMap[c.key] = c.value; });

        result = {
          is_online: isOnline,
          last_heartbeat: hb?.ts || null,
          config: config || [],
          config_map: configMap,
          disabled_commands: (() => { try { return JSON.parse(configMap.disabled_commands || "[]"); } catch { return []; } })(),
          command_channels: (() => { try { return JSON.parse(configMap.command_channels || "{}"); } catch { return {}; } })(),
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

      case "list_commands": {
        const { guild_id } = body;
        let perms: Record<string, string> = {};
        let disabled: string[] = [];
        let channels: Record<string, string> = {};

        if (guild_id) {
          const { data: permRows } = await sb.from("bot_command_permissions").select("command, min_level").eq("guild_id", guild_id);
          (permRows || []).forEach((r: any) => { perms[r.command] = r.min_level; });

          const { data: configRows } = await sb.from("bot_config").select("key, value").in("key", ["disabled_commands", "command_channels"]);
          (configRows || []).forEach((c: any) => {
            try {
              if (c.key === "disabled_commands") disabled = JSON.parse(c.value);
              if (c.key === "command_channels") channels = JSON.parse(c.value);
            } catch {}
          });
        }

        result = {
          commands: BOT_COMMANDS.map((cmd) => ({
            ...cmd,
            custom_level: perms[cmd.name] || null,
            effective_level: perms[cmd.name] || cmd.defaultLevel,
            disabled: disabled.includes(cmd.name),
            channel_restricted: channels[cmd.name] || null,
          })),
          categories: [...new Set(BOT_COMMANDS.map(c => c.category))],
        };
        break;
      }

      case "update_command_permission": {
        const { guild_id, command, min_level } = body;
        if (!guild_id || !command) return new Response(JSON.stringify({ error: "guild_id and command required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (min_level) {
          const { error } = await sb.from("bot_command_permissions").upsert({
            guild_id, command, min_level,
          }, { onConflict: "guild_id,command" });
          if (error) throw error;
        } else {
          await sb.from("bot_command_permissions").delete().eq("guild_id", guild_id).eq("command", command);
        }
        result = { success: true };
        break;
      }

      case "toggle_command": {
        const { guild_id, command } = body;
        if (!guild_id || !command) return new Response(JSON.stringify({ error: "guild_id and command required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

        const { data: row } = await sb.from("bot_config").select("value").eq("key", "disabled_commands").maybeSingle();
        let disabled: string[] = [];
        try { disabled = JSON.parse(row?.value || "[]"); } catch { disabled = []; }

        if (disabled.includes(command)) {
          disabled = disabled.filter((c: string) => c !== command);
        } else {
          disabled.push(command);
        }

        await sb.from("bot_config").upsert({
          key: "disabled_commands", value: JSON.stringify(disabled),
          updated_by: user.id, updated_at: new Date().toISOString(),
        });
        result = { success: true, disabled };
        break;
      }

      case "set_command_channel": {
        const { guild_id, command, channel_id } = body;
        if (!guild_id || !command) return new Response(JSON.stringify({ error: "guild_id and command required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

        const { data: row } = await sb.from("bot_config").select("value").eq("key", "command_channels").maybeSingle();
        let channels: Record<string, string> = {};
        try { channels = JSON.parse(row?.value || "{}"); } catch { channels = {}; }

        if (channel_id) {
          channels[command] = channel_id;
        } else {
          delete channels[command];
        }

        await sb.from("bot_config").upsert({
          key: "command_channels", value: JSON.stringify(channels),
          updated_by: user.id, updated_at: new Date().toISOString(),
        });
        result = { success: true, channels };
        break;
      }

      case "get_config": {
        const { data: config } = await sb.from("bot_config").select("key, value").order("key");
        const configMap: Record<string, any> = {};
        (config || []).forEach((c: any) => {
          try { configMap[c.key] = JSON.parse(c.value); } catch { configMap[c.key] = c.value; }
        });
        result = { config: configMap };
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
        const { guild_id } = body;
        const incoming = body.payload || body;
        const { title, description, game_url, image_url, channel_id } = incoming;
        if (!guild_id || !title) return new Response(JSON.stringify({ error: "guild_id and title required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const payload: any = { title, description: description || "" };
        if (channel_id) payload.channel_id = channel_id;
        if (game_url) payload.game_url = game_url;
        if (image_url) payload.image_url = image_url;
        if (incoming.mention) payload.mention = incoming.mention;
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
        }, { onConflict: "guild_id" });
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

      case "test_channel": {
        const { guild_id: gIdT, channel_id: chIdT, channel_name: chNameT } = body;
        if (!gIdT || !chIdT) return new Response(JSON.stringify({ error: "guild_id and channel_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { error: tcErr } = await sb.from("web_commands").insert({
          guild_id: gIdT, command: "test_channel", payload: { channel_id: chIdT, channel_name: chNameT || "channel" }, status: "pending",
        });
        if (tcErr) throw tcErr;
        result = { success: true };
        break;
      }

      case "set_bot_status": {
        const { guild_id: gIdS, status, activity } = body;
        if (!gIdS) return new Response(JSON.stringify({ error: "guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { error: sbErr } = await sb.from("web_commands").insert({
          guild_id: gIdS, command: "set_bot_status", payload: { status: status || "online", activity: activity || "" }, status: "pending",
        });
        if (sbErr) throw sbErr;
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

      case "get_feed_channels": {
        const { data: row } = await sb.from("bot_config").select("value").eq("key", "channel_feeds").maybeSingle();
        let feeds: Record<string, string> = {};
        try { feeds = JSON.parse(row?.value || "{}"); } catch {}
        result = { feeds };
        break;
      }

      case "save_feed_channel": {
        const { feed_type, channel_id, guild_id } = body;
        if (!feed_type) return new Response(JSON.stringify({ error: "feed_type required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: feedRow } = await sb.from("bot_config").select("value").eq("key", "channel_feeds").maybeSingle();
        let feeds: Record<string, string> = {};
        try { feeds = JSON.parse(feedRow?.value || "{}"); } catch {}
        if (channel_id) {
          feeds[feed_type] = channel_id;
        } else {
          delete feeds[feed_type];
        }
        await sb.from("bot_config").upsert({
          key: "channel_feeds", value: JSON.stringify(feeds),
          updated_by: user.id, updated_at: new Date().toISOString(),
        });
        result = { success: true, feeds };
        break;
      }

      case "auto_post": {
        const { feed_type, title, description, url, image_url } = body;
        if (!feed_type || !title) return new Response(JSON.stringify({ error: "feed_type and title required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: feedConfig } = await sb.from("bot_config").select("value").eq("key", "channel_feeds").maybeSingle();
        let feeds: Record<string, string> = {};
        try { feeds = JSON.parse(feedConfig?.value || "{}"); } catch {}
        const channelId = feeds[feed_type];
        if (!channelId) { result = { success: false, reason: "No channel configured for " + feed_type }; break; }
        const { data: gRow } = await sb.from("bot_config").select("value").eq("key", "default_guild_id").maybeSingle();
        const guildId = gRow?.value || body.guild_id || "";
        const payload: any = { channel_id: channelId, title, description: description || "" };
        if (url) payload.game_url = url;
        if (image_url) payload.image_url = image_url;
        const { data, error } = await sb.from("web_commands").insert({
          guild_id: guildId, command: "auto_post", payload, status: "pending",
        }).select().single();
        if (error) throw error;
        result = { success: true, id: data.id };
        break;
      }

      case "get_ai_channels": {
        const { data: aiRow } = await sb.from("bot_config").select("value").eq("key", "ai_channels").maybeSingle();
        let channels: string[] = [];
        try { channels = JSON.parse(aiRow?.value || "[]"); } catch {}
        result = { channels };
        break;
      }

      case "enable_ai_channel": {
        const { channel_id, guild_id } = body;
        if (!channel_id || !guild_id) return new Response(JSON.stringify({ error: "channel_id and guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: aiRow2 } = await sb.from("bot_config").select("value").eq("key", "ai_channels").maybeSingle();
        let channels2: string[] = [];
        try { channels2 = JSON.parse(aiRow2?.value || "[]"); } catch {}
        if (!channels2.includes(channel_id)) channels2.push(channel_id);
        await sb.from("bot_config").upsert({ key: "ai_channels", value: JSON.stringify(channels2), updated_by: user.id, updated_at: new Date().toISOString() });
        const enablePayload: any = { channel_id };
        if (body.mention) enablePayload.mention = body.mention;
        const { error: wcErr } = await sb.from("web_commands").insert({
          guild_id, command: "enable_ai_channel", payload: enablePayload, status: "pending",
        });
        if (wcErr) throw wcErr;
        result = { success: true, channels: channels2 };
        break;
      }

      case "disable_ai_channel": {
        const { channel_id: chId, guild_id: gId } = body;
        if (!chId || !gId) return new Response(JSON.stringify({ error: "channel_id and guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: aiRow3 } = await sb.from("bot_config").select("value").eq("key", "ai_channels").maybeSingle();
        let channels3: string[] = [];
        try { channels3 = JSON.parse(aiRow3?.value || "[]"); } catch {}
        channels3 = channels3.filter((c: string) => c !== chId);
        await sb.from("bot_config").upsert({ key: "ai_channels", value: JSON.stringify(channels3), updated_by: user.id, updated_at: new Date().toISOString() });
        const disablePayload: any = { channel_id: chId };
        if (body.mention) disablePayload.mention = body.mention;
        const { error: wcErr2 } = await sb.from("web_commands").insert({
          guild_id: gId, command: "disable_ai_channel", payload: disablePayload, status: "pending",
        });
        if (wcErr2) throw wcErr2;
        result = { success: true, channels: channels3 };
        break;
      }

      case "get_guild_channels": {
        const { guild_id: gId2 } = body;
        if (!gId2) return new Response(JSON.stringify({ error: "guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: guildRow } = await sb.from("bot_guilds").select("channels, categories, roles").eq("guild_id", gId2).maybeSingle();
        let channels4: any[] = [];
        let categories4: any[] = [];
        let roles4: any[] = [];
        try { channels4 = typeof guildRow?.channels === 'string' ? JSON.parse(guildRow.channels) : (guildRow?.channels || []); } catch {}
        try { categories4 = typeof guildRow?.categories === 'string' ? JSON.parse(guildRow.categories) : (guildRow?.categories || []); } catch {}
        try { roles4 = typeof guildRow?.roles === 'string' ? JSON.parse(guildRow.roles) : (guildRow?.roles || []); } catch {}
        result = { channels: channels4, categories: categories4, roles: roles4 };
        break;
      }

      case "publish_game": {
        const { guild_id, game_id, channel_id, item_type } = body;
        if (!guild_id || !game_id) return new Response(JSON.stringify({ error: "guild_id and game_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        let item: any = null;
        let itemType = item_type || "game";
        let siteUrl = "";
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(game_id);
        if (body.game_title) {
          item = { title: body.game_title, description: body.game_description || "", thumbnail_url: body.thumbnail || "", video_url: body.video_url || "", game_url: body.game_url || "", category: body.category || "", price: body.price || "Free", is_official: body.is_official ?? false, likes_count: body.likes_count ?? 0, views_count: body.views_count ?? 0, download_url: body.download_url || "", creator_id: "" };
          siteUrl = `https://yobest-bytr.vercel.app/games/${game_id}`;
        } else if (isUuid) {
          if (itemType === "asset") {
            const { data: asset, error: assetErr } = await sb.from("assets").select("id, title, description, thumbnail_url, drive_file_url, type, price_robux, downloads_count, created_at").eq("id", game_id).maybeSingle();
            if (assetErr) return new Response(JSON.stringify({ error: "Asset query failed: " + assetErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            if (asset) { item = asset; siteUrl = `https://yobest-bytr.vercel.app/marketplace`; }
          } else {
            const { data: exp, error: expErr } = await sb.from("experiences").select("id, creator_id, title, description, thumbnail_url, video_url, download_url, game_url, category, price, is_official, likes_count, views_count, created_at").eq("id", game_id).maybeSingle();
            if (expErr) return new Response(JSON.stringify({ error: "Game query failed: " + expErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            if (exp) { item = exp; itemType = "game"; siteUrl = `https://yobest-bytr.vercel.app/games/${exp.id}`; }
          }
        }
        if (!item) return new Response(JSON.stringify({ error: "Item not found for id: " + game_id }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const payload: any = {
          game_title: item.title,
          game_description: item.description || "",
          channel_id: channel_id || "",
          item_type: itemType,
          site_url: siteUrl,
          thumbnail: resolveGameThumb(item),
          creator: "",
          category: item.category || "",
        };
        if (item.creator_id) {
          const { data: creatorProfile } = await sb.from("profiles").select("username, display_name").eq("id", item.creator_id).maybeSingle();
          if (creatorProfile) payload.creator = creatorProfile.display_name || creatorProfile.username || "";
        }
        if (item.game_url) payload.game_url = item.game_url;
        if (item.drive_file_url) payload.game_url = item.drive_file_url;
        if (item.price !== undefined) payload.price = item.price;
        if (item.is_official !== undefined) payload.is_official = item.is_official;
        if (item.type) payload.asset_type = item.type;
        if (item.price_robux !== undefined) payload.price_robux = item.price_robux;
        if (item.downloads_count !== undefined) payload.downloads_count = item.downloads_count;
        if (item.likes_count !== undefined) payload.likes_count = item.likes_count;
        if (item.views_count !== undefined) payload.views_count = item.views_count;
        if (item.created_at) payload.created_at = item.created_at;
        if (body.mention) payload.mention = body.mention;
        const { data: wc, error: wcErr } = await sb.from("web_commands").insert({
          guild_id, command: "publish_game", payload, status: "pending",
        }).select().single();
        if (wcErr) throw wcErr;
        result = { success: true, id: wc.id, game: item.title };
        break;
      }

      case "publish_all_games": {
        const { guild_id: gId3, channel_id: chId3, item_type: allType } = body;
        if (!gId3) return new Response(JSON.stringify({ error: "guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: feedConf2 } = await sb.from("bot_config").select("value").eq("key", "channel_feeds").maybeSingle();
        let feeds2: Record<string, string> = {};
        try { feeds2 = JSON.parse(feedConf2?.value || "{}"); } catch {}
        const targetChannel = chId3 || feeds2.game_feed || "";
        if (!targetChannel) return new Response(JSON.stringify({ error: "No channel specified and no game_feed channel configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        let items: any[] = [];
        if (allType === "asset") {
          const { data: allAssets } = await sb.from("assets").select("id, title, description, thumbnail_url, drive_file_url, type, price_robux, downloads_count, created_at").order("created_at", { ascending: false });
          items = (allAssets || []).map((a: any) => ({
            game_title: a.title, game_description: a.description || "", game_url: a.drive_file_url || "", thumbnail: toDirectImageUrl(a.thumbnail_url || ""),
            item_type: "asset", site_url: "https://yobest-bytr.vercel.app/marketplace",
            asset_type: a.type || "", price_robux: a.price_robux ?? 0, downloads_count: a.downloads_count ?? 0,
            creator: "", category: a.type || "", created_at: a.created_at || "",
          }));
        } else {
          const { data: allExps } = await sb.from("experiences").select("id, creator_id, title, description, game_url, download_url, thumbnail_url, video_url, category, price, is_official, likes_count, views_count, created_at").order("created_at", { ascending: false });
          items = (allExps || []).map((e: any) => ({
            game_title: e.title, game_description: e.description || "", game_url: e.game_url || "", thumbnail: resolveGameThumb(e),
            item_type: "game", site_url: `https://yobest-bytr.vercel.app/games/${e.id}`,
            category: e.category || "", price: e.price || "Free", is_official: e.is_official || false,
            likes_count: e.likes_count ?? 0, views_count: e.views_count ?? 0,
            creator: e.creator_id || "", created_at: e.created_at || "",
          }));
        }
        if (!items.length) { result = { success: true, posted: 0, reason: "No items found" }; break; }
        let posted = 0;
        for (const item of items) {
          const p: any = { ...item, channel_id: targetChannel };
          if (body.mention) p.mention = body.mention;
          await sb.from("web_commands").insert({ guild_id: gId3, command: "publish_game", payload: p, status: "pending" });
          posted++;
        }
        result = { success: true, posted };
        break;
      }

      case "publish_selected_games": {
        const { guild_id: gId6, channel_id: chId6, game_ids, item_type: selType } = body;
        if (!gId6 || !game_ids?.length) return new Response(JSON.stringify({ error: "guild_id and game_ids required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: feedConf3 } = await sb.from("bot_config").select("value").eq("key", "channel_feeds").maybeSingle();
        let feeds3: Record<string, string> = {};
        try { feeds3 = JSON.parse(feedConf3?.value || "{}"); } catch {}
        const targetChannel2 = chId6 || feeds3.game_feed || "";
        if (!targetChannel2) return new Response(JSON.stringify({ error: "No channel specified and no game_feed channel configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        let items2: any[] = [];
        if (selType === "asset") {
          const { data: selAssets } = await sb.from("assets").select("id, title, description, thumbnail_url, drive_file_url, type, price_robux, downloads_count, created_at").in("id", game_ids);
          items2 = (selAssets || []).map((a: any) => ({
            game_title: a.title, game_description: a.description || "", game_url: a.drive_file_url || "", thumbnail: toDirectImageUrl(a.thumbnail_url || ""),
            item_type: "asset", site_url: "https://yobest-bytr.vercel.app/marketplace",
            asset_type: a.type || "", price_robux: a.price_robux ?? 0, downloads_count: a.downloads_count ?? 0,
            creator: "", category: a.type || "", created_at: a.created_at || "",
          }));
        } else {
          const { data: selExps } = await sb.from("experiences").select("id, creator_id, title, description, thumbnail_url, video_url, download_url, game_url, category, price, is_official, likes_count, views_count, created_at").in("id", game_ids);
          items2 = (selExps || []).map((e: any) => ({
            game_title: e.title, game_description: e.description || "", game_url: e.game_url || "", thumbnail: resolveGameThumb(e),
            item_type: "game", site_url: `https://yobest-bytr.vercel.app/games/${e.id}`,
            category: e.category || "", price: e.price || "Free", is_official: e.is_official || false,
            likes_count: e.likes_count ?? 0, views_count: e.views_count ?? 0,
            creator: e.creator_id || "", created_at: e.created_at || "",
          }));
        }
        if (!items2.length) { result = { success: true, posted: 0, reason: "No matching items" }; break; }
        let posted2 = 0;
        for (const item of items2) {
          const p: any = { ...item, channel_id: targetChannel2 };
          if (body.mention) p.mention = body.mention;
          await sb.from("web_commands").insert({ guild_id: gId6, command: "publish_game", payload: p, status: "pending" });
          posted2++;
        }
        result = { success: true, posted: posted2 };
        break;
      }

      case "get_games": {
        const { data: exps } = await sb.from("experiences").select("id, title, description, game_url, thumbnail_url, video_url, download_url, category, price, is_official, views_count, likes_count, created_at").order("created_at", { ascending: false }).limit(50);
        const { data: assetsList } = await sb.from("assets").select("id, title, description, type, thumbnail_url, gallery_images, price_robux, downloads_count, rating, created_at").order("created_at", { ascending: false }).limit(50);
        result = { experiences: exps || [], assets: assetsList || [] };
        break;
      }

      case "ai_builder": {
        const { guild_id: gId4, instruction, mode } = body;
        if (!gId4 || !instruction) return new Response(JSON.stringify({ error: "guild_id and instruction required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const cmdName = mode === "generate" ? "generate" : "agent";
        const { data: wc2, error: wcErr3 } = await sb.from("web_commands").insert({
          guild_id: gId4, command: cmdName, payload: { instruction }, status: "pending",
        }).select().single();
        if (wcErr3) throw wcErr3;
        result = { success: true, id: wc2.id, command: cmdName };
        break;
      }

      case "get_agent_history": {
        const { data: agentCmds } = await sb.from("web_commands")
          .select("id, command, payload, status, result, created_at, executed_at")
          .in("command", ["agent", "generate"])
          .order("created_at", { ascending: false }).limit(20);
        result = { history: agentCmds || [] };
        break;
      }

      case "get_server_stats": {
        const { guild_id: gId5 } = body;
        if (!gId5) return new Response(JSON.stringify({ error: "guild_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: guildData } = await sb.from("bot_guilds").select("*").eq("guild_id", gId5).maybeSingle();
        const { data: history } = await sb.from("bot_guild_stats_history").select("member_count, captured_at").eq("guild_id", gId5).order("captured_at", { ascending: false }).limit(24);
        result = { guild: guildData || null, history: history || [] };
        break;
      }

      case "toggle_auto_publish": {
        const { key, value } = body;
        if (!key) return new Response(JSON.stringify({ error: "key required (auto_publish_games, auto_publish_assets)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const { data: existing } = await sb.from("bot_config").select("value").eq("key", key).maybeSingle();
        const newVal = existing?.value === "true" ? "false" : "true";
        await sb.from("bot_config").upsert({ key, value: newVal, updated_by: user.id, updated_at: new Date().toISOString() });
        result = { success: true, key, value: newVal };
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
