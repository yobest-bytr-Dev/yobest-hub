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
      const { messages, canvas_state } = body;
      const canvasContext = canvas_state && canvas_state.length > 0 ? `\nCurrent canvas has ${canvas_state.length} elements: ${canvas_state.map((e: any) => e.name).join(", ")}` : "\nCanvas is empty.";
      const SYSTEM_PROMPT = `OUTPUT ONLY VALID JSON. NO TEXT BEFORE OR AFTER. NO THINKING. NO EXPLANATION.

You are an expert Roblox game UI designer. You create professional, visually stunning game interfaces.

RESPONSE FORMAT (copy this exact structure):
{"message":"1 sentence describing what you built","commands":[...]}

COMMAND TYPES:
{"action":"add","elementType":"Frame","name":"FrameName","parent":null,"position":{"X":0.5,"Y":0.5},"size":{"X":0.4,"Y":0.5},"properties":{...}}
{"action":"modify","target":"FrameName","properties":{"BackgroundColor3":"#ff0000"}}
{"action":"remove","target":"FrameName"}

ELEMENT TYPES: Frame, TextLabel, TextButton, ImageLabel, ScrollingFrame, TextBox

DESIGN RULES:
- Use dark themes: #0d1117 (darkest), #161b22 (dark), #1e293b (medium), #334155 (light border)
- Accent colors: #3b82f6 (blue), #8b5cf6 (purple), #10b981 (green), #f59e0b (gold), #ef4444 (red), #ec4899 (pink)
- Text: #f1f5f9 (primary), #94a3b8 (secondary), #64748b (muted)
- CornerRadius: 8-16 for modern look, 4 for small elements
- Font: "GothamBold" for headings, "SourceSans" for body
- Position scale 0-1 where 0.5,0.5 = center
- NEST elements: create Frame first, then add children inside it with parent name
- Create 5-15 elements for a complete UI
- For images, use URLs from picsum.photos: https://picsum.photos/seed/{keyword}/400/300
- For game icons, use: https://picsum.photos/seed/{game}/200/200
- For backgrounds, use: https://picsum.photos/seed/{theme}/1920/1080

PROFESSIONAL UI PATTERNS:
- Shop: Dark frame with title, scrolling item grid, each item has icon+name+price+buy button
- Inventory: Grid of slots with item icons, item count badges
- HUD: Health/mana bars at bottom, minimap top-right, currency top-left
- Menu: Centered panel with logo, button list (Play, Settings, Credits), version text
- Stats: Player avatar + name + level + stat bars (STR, DEF, SPD, etc.)

Ask questions: {"message":"your question?","ask":true,"commands":[]}${canvasContext}`;

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yobest-bytr.vercel.app",
          "X-Title": "Yobest UI Builder",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: messages.length > 0 ? messages[messages.length - 1].content : "Create a shop UI" }
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      // Robust JSON extraction: find JSON object in possibly messy text
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Try to extract JSON from text that may contain thinking/explanation
        const jsonMatch = content.match(/\{[\s\S]*"message"[\s\S]*"commands"[\s\S]*\}/);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = null; }
        }
        if (!parsed) {
          // Last resort: find any { ... } block
          const braceMatch = content.match(/\{[\s\S]*\}/);
          if (braceMatch) {
            try { parsed = JSON.parse(braceMatch[0]); } catch { parsed = null; }
          }
        }
        if (!parsed) {
          parsed = { message: content.slice(0, 200), commands: [] };
        }
      }
      
      // Ensure commands is an array
      if (!Array.isArray(parsed.commands)) parsed.commands = [];
      if (!parsed.message) parsed.message = "Done";
      
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search-images") {
      const url2 = new URL(req.url);
      const query = url2.searchParams.get("q") || "";
      if (!query) {
        return new Response(JSON.stringify({ error: "Missing query" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      try {
        const resp = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${OPENROUTER_KEY}` } }
        );
        if (resp.ok) {
          const data = await resp.json();
          const images = (data.results || []).map((img: any) => ({
            url: img.urls?.small || img.urls?.regular,
            full: img.urls?.full,
            thumb: img.urls?.thumb,
            alt: img.alt_description || query,
            author: img.user?.name || "Unknown",
          }));
          return new Response(JSON.stringify({ images }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {}
      // Fallback: generate placeholder URLs
      const images = Array.from({ length: 6 }, (_, i) => ({
        url: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/400/300`,
        full: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/1200/800`,
        thumb: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/200/150`,
        alt: `${query} ${i + 1}`,
        author: "Picsum",
      }));
      return new Response(JSON.stringify({ images }), {
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
