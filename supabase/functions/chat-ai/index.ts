import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { messages, model = "google/gemini-2.5-flash" } = await req.json()

    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY")
    if (!openrouterKey) {
      throw new Error("OPENROUTER_API_KEY not configured. Add it in Supabase Dashboard > Edge Functions > Secrets.")
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

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterKey}`,
        "HTTP-Referer": "https://yobest.app",
        "X-Title": "Yobest AI Architect",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: apiMessages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
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
