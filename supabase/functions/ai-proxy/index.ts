import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

async function getRandomKey(sb: any): Promise<string> {
  // 1. Check if a direct key was passed in the request (for admin test)
  // 2. Try gemini_api_keys from bot_config (array)
  // 3. Try gemini_api_key from bot_config (single)
  // 4. Try env var GEMINI_API_KEY
  const { data: keysRow } = await sb
    .from("bot_config")
    .select("value")
    .eq("key", "gemini_api_keys")
    .maybeSingle();

  if (keysRow?.value) {
    try {
      const parsed = typeof keysRow.value === "string" ? JSON.parse(keysRow.value) : keysRow.value;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter to only keys that aren't known-broken
        const healthy = parsed.filter((k: any) => k.status !== "error");
        const pool = healthy.length > 0 ? healthy : parsed;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (pick?.key) return pick.key;
      }
    } catch {}
  }

  // Fallback to single key
  const { data: singleRow } = await sb
    .from("bot_config")
    .select("value")
    .eq("key", "gemini_api_key")
    .maybeSingle();
  if (singleRow?.value) {
    const v = typeof singleRow.value === "string" ? singleRow.value.replace(/^"|"$/g, "") : String(singleRow.value);
    if (v) return v;
  }

  // Env var
  return Deno.env.get("GEMINI_API_KEY") ?? "";
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const sb = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { messages, model: reqModel, temperature = 0.3, max_tokens = 4000, api_key: directKey } = body;

    // Use direct key if provided (admin test), otherwise pick from pool
    let geminiKey = directKey || "";
    if (!geminiKey) {
      geminiKey = await getRandomKey(sb);
    }

    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "No Gemini API key configured. Add keys in Admin > Settings." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // If no model specified, read from admin config
    let model = reqModel || "";
    if (!model) {
      const { data: modelRow } = await sb
        .from("bot_config")
        .select("value")
        .eq("key", "gemini_api_model")
        .maybeSingle();
      if (modelRow?.value) model = typeof modelRow.value === "string" ? modelRow.value.replace(/^"|"$/g, "") : String(modelRow.value);
    }

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

    // Try models in order
    const modelsToTry = model ? [model, ...FALLBACK_MODELS.filter((m) => m !== model)] : ["gemini-2.5-flash", ...FALLBACK_MODELS];
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
          continue;
        }

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
