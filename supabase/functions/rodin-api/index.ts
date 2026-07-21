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

You are a Roblox UI builder. You create UI elements by returning JSON commands.

RESPONSE FORMAT (copy this structure exactly):
{"message":"short description","commands":[{"action":"add","elementType":"Frame","name":"MyFrame","parent":null,"position":{"X":0.5,"Y":0.5},"size":{"X":0.4,"Y":0.5},"properties":{"BackgroundColor3":"#1e1e2e","BackgroundTransparency":0,"BorderSizePixel":0,"CornerRadius":12,"ZIndex":1}},{"action":"add","elementType":"TextLabel","name":"Title1","parent":"MyFrame","position":{"X":0.5,"Y":0.08},"size":{"X":0.8,"Y":0.1},"properties":{"Text":"Shop","TextColor3":"#ffffff","TextScaled":true,"Font":"GothamBold","BackgroundTransparency":1}},{"action":"modify","target":"MyFrame","properties":{"BackgroundColor3":"#ff0000"}},{"action":"remove","target":"SomeName"}]}

RULES:
- "message": 1 sentence describing what you did
- "commands": array of add/modify/remove actions
- add: elementType, name, parent (null=root or parent name), position {X,Y} scale 0-1, size {X,Y} scale 0-1, properties object
- modify: target=name, properties=changed props
- remove: target=name
- Colors: hex strings "#rrggbb"
- CornerRadius: number (8-16 typical)
- Text: string, TextScaled: boolean, Font: "GothamBold" or "SourceSans"
- BackgroundTransparency: 0=opaque, 1=invisible
- Position 0.5,0.5 = center of parent
- Nest elements: parent name must match an existing or planned element name
- Dark themes: backgrounds #1a1a2e #2a2a3e #0d1117, text #ffffff, accents #4ecca3 #ff6b6b #ffd93d
- Generate complete layouts with 5-15 elements for complex UIs
- For questions: {"message":"your question?","ask":true,"commands":[]}${canvasContext}`;

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
