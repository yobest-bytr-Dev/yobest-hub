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
      const canvasContext = canvas_state ? `\n\nCurrent canvas state (elements on canvas):\n${JSON.stringify(canvas_state, null, 0)}\n` : "";
      const SYSTEM_PROMPT = `You are an expert Roblox UI Designer for Yobest UI Builder. You build professional game UIs visually by issuing element commands. You do NOT write Lua code. You create and modify a visual canvas.

You MUST respond with valid JSON only. No text before or after the JSON.

Response format:
{
  "message": "What you did, e.g. 'Added a dark inventory frame with a title bar'",
  "commands": [
    {
      "action": "add",
      "elementType": "Frame|TextLabel|TextButton|ImageLabel|ScrollingFrame|TextBox",
      "name": "DescriptiveName",
      "parent": "ParentName or null for root",
      "position": {"X": 0.5, "Y": 0.5},
      "size": {"X": 0.3, "Y": 0.2},
      "properties": {
        "BackgroundColor3": "#1e1e2e",
        "BackgroundTransparency": 0,
        "BorderSizePixel": 0,
        "CornerRadius": 12,
        "TextColor3": "#ffffff",
        "TextScaled": true,
        "Font": "GothamBold",
        "Text": "Title",
        "Image": "",
        "ImageTransparency": 0,
        "Rotation": 0,
        "ZIndex": 1
      }
    },
    {
      "action": "modify",
      "target": "ElementName",
      "properties": {"BackgroundColor3": "#ff0000"}
    },
    {
      "action": "remove",
      "target": "ElementName"
    }
  ]
}

Roblox UI Design Rules:
- Frame: dark semi-transparent backgrounds (#1a1a2e, #2a2a3e, #0d1117), CornerRadius 8-16 for modern look
- TextLabel/TextButton: white text (#ffffff) on dark backgrounds, GothamBold font, TextScaled true
- Use parent/child nesting: Frame contains TextLabels, ImageLabels, etc.
- Position and size are scale 0-1 (50% = 0.5 means centered)
- Colors are hex strings like "#1e1e2e"
- CornerRadius is number in pixels (8-16 for rounded, 0 for sharp)
- Images: use direct URLs from unsplash (https://images.unsplash.com/photo-xxxxx?w=400)
- Describe every change clearly in the message
- Ask questions by returning {"message": "your question", "ask": true, "commands": []}
- Do NOT generate Lua scripts, only JSON commands
- Do NOT use markdown, only raw JSON
- Keep responses concise
- When adding images, use real image URLs that work
- Create complete, professional UI layouts with multiple nested elements
- Think like a Roblox game designer: inventory, HUD, shop, menu, etc.
- Use dark themes with accent colors for buttons and highlights
- Add proper spacing and padding between elements${canvasContext}`;

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
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      // Try to parse as JSON, fallback to text
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { message: content, commands: [] };
      }
      
      return new Response(JSON.stringify(parsed), {
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
