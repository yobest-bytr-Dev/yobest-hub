import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RODIN_KEY = "vibecoding";
const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY") ?? "";

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
    const action = url.searchParams.get("action") || "";

    if (action === "submit") {
      const formData = await req.formData();
      const resp = await fetch("https://api.hyper3d.com/api/v2/rodin", {
        method: "POST",
        headers: { Authorization: `Bearer ${RODIN_KEY}` },
        body: formData,
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    if (action === "status") {
      const body = await req.json();
      const resp = await fetch("https://api.hyper3d.com/api/v2/status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RODIN_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ subscription_key: body.subscription_key }),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    if (action === "download") {
      const body = await req.json();
      const resp = await fetch("https://api.hyper3d.com/api/v2/download", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RODIN_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ task_uuid: body.task_uuid }),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    if (action === "proxy") {
      const fileUrl = url.searchParams.get("url");
      if (!fileUrl) {
        return new Response(JSON.stringify({ error: "Missing url" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const resp = await fetch(fileUrl, {
        headers: { Accept: "*/*" },
      });
      return new Response(resp.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": resp.headers.get("content-type") || "model/gltf-binary",
          "Cache-Control": "public, max-age=3600",
        },
        status: resp.status,
      });
    }

    if (action === "chat") {
      const body = await req.json();
      const { messages } = body;
      const SYSTEM_PROMPT = `You are a Smart Assistant for a 3D Model Generator powered by Yobest Bytr and Hyper3D Rodin AI.

Your job is to help users write better prompts for generating 3D models. When the user describes what they want in natural language, you help them refine it into a clear, effective prompt.

Rules:
- Be concise, friendly, and helpful
- Suggest improved prompts that work well for 3D model generation
- Good prompts describe: object name, shape, style, material, color, and intended use
- Keep prompts under 100 words
- When you have a refined prompt, output ONLY the final prompt text wrapped like: [PROMPT]your refined prompt here[/PROMPT]
- For 3D model generation, simple focused descriptions work best
- Do NOT use markdown formatting
- Write in plain text only`;

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yobest-bytr.vercel.app",
          "X-Title": "Yobest 3D Generator",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ui-generate") {
      const body = await req.json();
      const { messages } = body;
      const SYSTEM_PROMPT = `You are a Roblox UI Code Generator assistant for Yobest Bytr.

Your job is to help users create Roblox UI layouts. When the user describes a UI, you generate the corresponding Roblox Lua code or detailed description.

Rules:
- Generate clean Roblox Studio Lua code for ScreenGui elements
- Include Frame, TextLabel, TextButton, ImageLabel, UICorner, UIStroke, UIGradient etc.
- Use modern UI design patterns (rounded corners, gradients, shadows)
- Provide working code that can be pasted into Roblox Studio
- Be concise and helpful
- Do NOT use markdown code blocks, just output the raw Lua code
- If the user is just chatting, respond briefly and help them describe what UI they want`;

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yobest-bytr.vercel.app",
          "X-Title": "Yobest UI Generator",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
