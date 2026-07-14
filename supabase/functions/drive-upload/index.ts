import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing authorization header")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Unauthorized")
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      throw new Error("No file provided")
    }

    const googleClientId = Deno.env.get("GOOGLE_DRIVE_CLIENT_ID")
    const googleClientSecret = Deno.env.get("GOOGLE_DRIVE_CLIENT_SECRET")
    const googleRefreshToken = Deno.env.get("GOOGLE_DRIVE_REFRESH_TOKEN")

    if (!googleClientId || !googleClientSecret || !googleRefreshToken) {
      throw new Error("Google Drive credentials not configured. Please set GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN in Supabase Edge Function Secrets.")
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        refresh_token: googleRefreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text()
      let hint = ""
      if (errBody.includes("invalid_client")) {
        hint = " — Your Google OAuth client credentials are invalid. Please create new credentials in Google Cloud Console and update the secrets in Supabase Dashboard → Edge Functions → Secrets."
      }
      throw new Error(`Failed to get Google access token (${tokenResponse.status})${hint}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    const fileBuffer = await file.arrayBuffer()
    const metadata = {
      name: file.name,
      mimeType: file.type,
    }

    const boundary = "----FormBoundary" + Math.random().toString(36).slice(2)
    const encodedFile = arrayBufferToBase64(fileBuffer)
    const bodyParts = [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: ${file.type}\r\nContent-Transfer-Encoding: base64\r\n\r\n${encodedFile}\r\n`,
      `--${boundary}--`,
    ]

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: bodyParts.join(""),
      }
    )

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Google Drive upload error: ${uploadResponse.status} ${errorText}`)
    }

    const uploadData = await uploadResponse.json()
    const fileId = uploadData.id

    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      }
    )

    const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`

    return new Response(
      JSON.stringify({
        fileId,
        fileName: file.name,
        fileUrl: viewUrl,
        directLink,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
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
