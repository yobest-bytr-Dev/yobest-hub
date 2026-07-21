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
      const canvasContext = canvas_state ? `\n\nCurrent canvas state:\n${JSON.stringify(canvas_state, null, 0)}\n` : "";
      const SYSTEM_PROMPT = `You are a Roblox UI Builder for Yobest Bytr. You visually build UIs by issuing commands. You do NOT write Lua code. You modify a visual canvas in real time.

You MUST respond with valid JSON only. No text before or after the JSON.

Response format:
{
  "message": "Natural language description of what you did or your question",
  "commands": [
    {
      "action": "add",
      "elementType": "Frame|TextLabel|TextButton|ImageLabel|ScrollingFrame|UICorner|UIStroke|UIGradient",
      "name": "UniqueName",
      "parent": "ParentName or null for root",
      "position": {"X": 0.5, "Y": 0.5},
      "size": {"X": 0.3, "Y": 0.2},
      "properties": {
        "BackgroundColor3": "#1a1a2e",
        "BackgroundTransparency": 0,
        "BorderSizePixel": 0,
        "CornerRadius": 8,
        "TextColor3": "#ffffff",
        "TextScaled": true,
        "Font": "GothamBold",
        "Text": "Hello",
        "Image": "",
        "ImageTransparency": 0,
        "Rotation": 0,
        "ZIndex": 1,
        "AnchorPoint": {"X": 0.5, "Y": 0.5}
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

Rules:
- Always respond with valid JSON only
- Use "add" to create elements, "modify" to change them, "remove" to delete
- Position and size are scale 0-1 (percentage of parent)
- Colors are hex strings like "#ff0000"
- When adding UICorner, set CornerRadius in properties (number in pixels)
- Images use direct URLs (lh3.googleusercontent.com or i.imgur.com preferred)
- Describe every change in the message field clearly
- Ask questions by setting "ask": true in the response: {"message": "your question", "ask": true, "commands": []}
- For images, you can search for free images on Unsplash: https://source.unsplash.com/featured/?{keywords}
- Do NOT generate Lua scripts, only JSON commands
- Do NOT use markdown code blocks
- Keep responses concise and friendly
- When the user asks to add an image, use a direct image URL from unsplash or similar

Image search: When user wants images, use URLs like https://source.unsplash.com/400x300/?{search-term}
For transparent PNGs, use https://png.pngtree.com/png-clipart/{id}.png or similar
For Roblox assets, use Roblox CDN URLs when available${canvasContext}`;

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
