import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userIdsParam = url.searchParams.get("userIds") || "";
    if (!userIdsParam) {
      return new Response(JSON.stringify({ error: "Missing userIds" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const ids = userIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
    const result: Record<string, string> = {};

    // Batch request to Roblox Thumbnails API
    try {
      const resp = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids.join(",")}&size=150x150&format=Png&isCircular=false`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.data)) {
          for (const item of data.data) {
            if (item.targetId && item.state === "Completed" && item.imageUrl) {
              result[String(item.targetId)] = item.imageUrl;
            }
          }
        }
      }
    } catch {}

    // For any still missing, try individual headshot endpoint
    const missing = ids.filter((id) => !result[id]);
    for (const id of missing) {
      try {
        const resp = await fetch(
          `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=150&height=150&format=png`,
          { redirect: "follow", signal: AbortSignal.timeout(5000) }
        );
        if (resp.ok) {
          result[id] = resp.url;
        }
      } catch {}
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
