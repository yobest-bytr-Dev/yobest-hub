import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

async function getHealthyKeys(sb: any): Promise<string[]> {
  const { data: keysRow } = await sb
    .from("bot_config")
    .select("value")
    .eq("key", "gemini_api_keys")
    .maybeSingle();

  if (keysRow?.value) {
    try {
      const parsed = typeof keysRow.value === "string" ? JSON.parse(keysRow.value) : keysRow.value;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const healthy = parsed.filter((k: any) => k.status !== "error" && k.key);
        if (healthy.length > 0) {
          // Shuffle healthy keys for random distribution
          const shuffled = [...healthy].sort(() => Math.random() - 0.5);
          return shuffled.map((k: any) => k.key);
        }
        // Fallback: try all keys if none marked healthy
        const all = parsed.filter((k: any) => k.key);
        return all.sort(() => Math.random() - 0.5).map((k: any) => k.key);
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
    if (v) return [v];
  }

  const envKey = Deno.env.get("GEMINI_API_KEY") ?? "";
  return envKey ? [envKey] : [];
}

async function testSingleKey(key: string): Promise<{ ok: boolean; error?: string; models?: string }> {
  const testModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
  for (const model of testModels) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Say OK" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );
      const data = await resp.json();
      if (resp.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { ok: true, models: model };
      }
      const errMsg = data?.error?.message || `HTTP ${resp.status}`;
      if (errMsg.includes("quota") || errMsg.includes("rate")) {
        return { ok: false, error: "Quota/rate limit exceeded" };
      }
      if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("invalid")) {
        return { ok: false, error: "Invalid API key" };
      }
      return { ok: false, error: errMsg.slice(0, 100) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Network error" };
    }
  }
  return { ok: false, error: "All test models failed" };
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

    // ── ACTION: test-all-keys ──────────────────────────────────────
    if (body.action === "test-all-keys") {
      const keys: string[] = body.keys || [];
      if (keys.length === 0) {
        return new Response(
          JSON.stringify({ error: "No keys provided" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const results = await Promise.all(
        keys.map(async (key) => {
          const result = await testSingleKey(key);
          return { key: key.slice(0, 8) + "..." + key.slice(-4), fullKey: key, ...result };
        })
      );

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Normal chat completion request ──────────────────────────────
    const { messages, model: reqModel, temperature = 0.3, max_tokens = 4000, api_key: directKey } = body;

    let keysToTry: string[] = [];
    if (directKey) {
      keysToTry = [directKey];
    } else {
      keysToTry = await getHealthyKeys(sb);
    }

    if (keysToTry.length === 0) {
      return new Response(
        JSON.stringify({ error: "No Gemini API key configured. Add keys in Admin > Settings." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    let model = reqModel || "";
    if (!model) {
      const { data: modelRow } = await sb
        .from("bot_config")
        .select("value")
        .eq("key", "gemini_api_model")
        .maybeSingle();
      if (modelRow?.value) model = typeof modelRow.value === "string" ? modelRow.value.replace(/^"|"$/g, "") : String(modelRow.value);
    }

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

    const modelsToTry = model ? [model, ...FALLBACK_MODELS.filter((m) => m !== model)] : FALLBACK_MODELS;
    let lastError = "";

    // Try every key × every model combination
    for (const key of keysToTry) {
      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

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
            // If rate limited or quota exceeded, try next key
            if (lastError.includes("quota") || lastError.includes("rate")) {
              console.log(`Key ...${key.slice(-4)} + ${modelName} rate limited, trying next...`);
              break; // break inner loop, try next key
            }
            // For other errors (invalid key, etc.), try next model with same key
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
    }

    return new Response(
      JSON.stringify({ error: `All Gemini models failed with all keys. Last error: ${lastError}` }),
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
