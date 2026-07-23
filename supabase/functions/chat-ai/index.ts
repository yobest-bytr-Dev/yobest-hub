import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { messages, model: reqModel } = await req.json()

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const sb = createClient(supabaseUrl, supabaseKey)

    // Read admin-selected model from config
    let model = reqModel || ""
    if (!model) {
      const { data: modelRow } = await sb.from("bot_config").select("value").eq("key", "gemini_api_model").maybeSingle()
      if (modelRow?.value) model = typeof modelRow.value === "string" ? modelRow.value.replace(/^"|"$/g, "") : String(modelRow.value)
    }
    if (!model) model = "gemini-2.5-flash"

    let geminiKey = "";

    // Try multi-key pool first
    const { data: keysRow } = await sb
      .from("bot_config")
      .select("value")
      .eq("key", "gemini_api_keys")
      .maybeSingle();
    if (keysRow?.value) {
      try {
        const parsed = typeof keysRow.value === "string" ? JSON.parse(keysRow.value) : keysRow.value;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const healthy = parsed.filter((k: any) => k.status !== "error");
          const pool = healthy.length > 0 ? healthy : parsed;
          const pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick?.key) geminiKey = pick.key;
        }
      } catch {}
    }

    // Fallback to single key
    if (!geminiKey) {
      const { data: row } = await sb
        .from("bot_config")
        .select("value")
        .eq("key", "gemini_api_key")
        .maybeSingle();
      if (row?.value) geminiKey = typeof row.value === "string" ? row.value.replace(/^"|"$/g, "") : String(row.value);
    }

    // Env var
    if (!geminiKey) geminiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

    if (!geminiKey) {
      throw new Error("No Gemini API key configured. Ask admin to add one in Admin > Settings.")
    }

    const systemPrompt = `You are Yobest AI, a Roblox Studio Luau coding assistant. Your ONLY job is to produce complete, working, copy-paste-ready Luau scripts.

## CRITICAL RULES — VIOLATION = FAILURE

### Code Formatting (MOST IMPORTANT)
- ALL code MUST be inside triple backtick luau blocks like this:
\`\`\`luau
local Players = game:GetService("Players")
-- code here
\`\`\`
- NEVER output raw code outside of backtick blocks
- EVERY script must have an opening \`\`\`luau and closing \`\`\`
- If the AI does not use code blocks, the code will not display properly

### Separator Lines (FORBIDDEN)
- NEVER use ---, ===, ***, ___, ~~~, or ### as separators
- NEVER use any line of repeated characters as decoration
- Use blank lines instead

### Headers and Formatting
- NEVER use ## or ### markdown headers
- NEVER use **bold** text
- NEVER use emoji
- Use plain text like: "Place this in ServerScriptService:"
- Use plain text like: "How it works:" followed by bullet points with -

### Code Quality
- Every script starts with ALL game:GetService() calls cached at top
- Every variable declared with local before use
- Every DataStore call wrapped in pcall
- Use task.wait(), task.spawn(), task.delay() — never wait() or spawn()
- Script must be syntactically correct complete Luau
- Never truncate code with ... or similar

## RESPONSE FORMAT (follow exactly)

1-2 sentences explaining what this does.

Place this in ServerScriptService:

\`\`\`luau
-- complete working script here
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
-- etc
\`\`\`

- How to use it: (3-5 bullet points starting with -)

That is the ONLY acceptable format. No headers. No separators. No bold. Just plain text and code blocks.`

    const contents: any[] = []
    for (const msg of messages || []) {
      if (msg.role === "user" || msg.role === "assistant") {
        contents.push({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] })
      }
    }

    if (contents.length === 0) {
      throw new Error("No user message provided")
    }

    const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]
    const modelsToTry = [model, ...geminiModels.filter((m) => m !== model)]
    let lastError = ""

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${geminiKey}`

        const payload = {
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!resp.ok) {
          const errText = await resp.text()
          lastError = `HTTP ${resp.status}: ${errText}`
          console.log(`Gemini ${modelName} failed: ${lastError}`)
          continue
        }

        // Transform Gemini SSE stream to OpenAI-compatible SSE stream
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const reader = resp.body?.getReader()
              if (!reader) { controller.close(); return }

              let buffer = ""
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n")
                buffer = lines.pop() || ""

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6))
                      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
                      if (text) {
                        const chunk = JSON.stringify({ choices: [{ delta: { content: text } }] })
                        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
                      }
                    } catch {}
                  }
                }
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              controller.close()
            } catch (e) {
              controller.error(e)
            }
          },
        })

        return new Response(stream, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown error"
        console.log(`Gemini ${modelName} error: ${lastError}`)
      }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
