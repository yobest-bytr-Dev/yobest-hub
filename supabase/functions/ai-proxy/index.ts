import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const sb = createClient(supabaseUrl, supabaseKey);

    // Read Gemini API key from bot_config or Supabase secret
    let geminiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

    if (!geminiKey) {
      const { data: row } = await sb
        .from("bot_config")
        .select("value")
        .eq("key", "gemini_api_key")
        .maybeSingle();
      if (row?.value) geminiKey = typeof row.value === "string" ? row.value.replace(/^"|"$/g, "") : String(row.value);
    }

    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "No Gemini API key configured. Ask admin to add one in Admin > Settings." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const body = await req.json();
    const { messages, model, temperature = 0.3, max_tokens = 4000 } = body;

    // Convert OpenAI-style messages to Gemini format
    let systemInstruction = "";
    const contents: any[] = [];

    for (const msg of messages || []) {
      if (msg.role === "system") {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    if (contents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No user message provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Try models in order (first param is the requested model, then fallbacks)
    const modelsToTry = [model, ...GEMINI_MODELS.filter((m) => m !== model)];

    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

        const payload: any = {
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: max_tokens,
          },
        };

        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await resp.json();

        if (!resp.ok) {
          lastError = data?.error?.message || `HTTP ${resp.status}`;
          console.log(`Gemini ${modelName} failed: ${lastError}`);
          continue;
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          lastError = "Empty response from Gemini";
          console.log(`Gemini ${modelName}: no text in response`);
          continue;
        }

        // Return in OpenAI-compatible format so client doesn't need major changes
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: text } }],
            model: modelName,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown error";
        console.log(`Gemini ${modelName} error: ${lastError}`);
      }
    }

    return new Response(
      JSON.stringify({ error: `All Gemini models failed. Last error: ${lastError}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
