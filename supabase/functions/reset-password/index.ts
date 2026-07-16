import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

if (typeof Deno.writeAll !== "function") {
  // @ts-ignore
  Deno.writeAll = async function (w: Deno.Writer, arr: Uint8Array) {
    let nwritten = 0;
    while (nwritten < arr.length) {
      nwritten += await w.write(arr.subarray(nwritten));
    }
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_USER = Deno.env.get("SMTP_USER") || "yobest.bytr47@gmail.com";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "nkthpnaudpauupmh";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildEmailHtml(code: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#07070d;font-family:Inter,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#0d0d14;border:1px solid #1e1e2e;border-radius:16px;padding:40px 32px;text-align:center;">
  <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#a855f7);display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
    <span style="font-size:28px;">&#128274;</span>
  </div>
  <h1 style="color:#f1f5f9;font-size:22px;margin:0 0 8px;">Password Reset Code</h1>
  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Enter this 6-digit code to reset your password</p>
  <div style="background:#1a1a2e;border:2px solid #3b82f6;border-radius:12px;padding:20px;margin:0 0 24px;">
    <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#f1f5f9;">${code}</span>
  </div>
  <p style="color:#64748b;font-size:12px;margin:0 0 8px;">This code expires in 15 minutes.</p>
  <p style="color:#64748b;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
</div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { email, code, newPassword, action } = await req.json();
  const normalizedEmail = (email || "").trim().toLowerCase();

  try {
    if (action === "send-code") {
      if (!normalizedEmail) {
        return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: corsHeaders });
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await adminClient
        .from("password_reset_codes")
        .delete()
        .eq("email", normalizedEmail)
        .eq("verified", false);

      const { error: insertError } = await adminClient.from("password_reset_codes").insert({
        email: normalizedEmail,
        code,
        verified: false,
        attempts: 0,
        expires_at: expiresAt,
      });
      if (insertError) throw insertError;

      const client = new SmtpClient();
      await client.connectTLS({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USER,
        password: SMTP_PASS,
      });

      await client.send({
        from: SMTP_USER,
        to: normalizedEmail,
        subject: "Your Yobest Password Reset Code",
        content: `Your password reset code is: ${code}`,
        html: buildEmailHtml(code),
      });

      await client.close();

      return new Response(JSON.stringify({ ok: true, message: "Code sent to your email." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
    }

    const cleanCode = String(code).trim();

    const { data: records, error: queryError } = await adminClient
      .from("password_reset_codes")
      .select("id, code, verified, attempts, expires_at")
      .eq("email", normalizedEmail)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (queryError) throw queryError;

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ error: "No valid code found. Please request a new one." }), { status: 400, headers: corsHeaders });
    }

    const record = records[0];

    if (new Date(record.expires_at) < new Date()) {
      await adminClient.from("password_reset_codes").delete().eq("id", record.id);
      return new Response(JSON.stringify({ error: "Code has expired. Please request a new one." }), { status: 400, headers: corsHeaders });
    }

    if (record.attempts >= 5) {
      await adminClient.from("password_reset_codes").delete().eq("id", record.id);
      return new Response(JSON.stringify({ error: "Too many failed attempts. Please request a new code." }), { status: 400, headers: corsHeaders });
    }

    if (record.code !== cleanCode) {
      await adminClient
        .from("password_reset_codes")
        .update({ attempts: record.attempts + 1 })
        .eq("id", record.id);
      return new Response(JSON.stringify({ error: `Incorrect code. ${4 - record.attempts} attempts remaining.` }), { status: 400, headers: corsHeaders });
    }

    if (action === "verify") {
      return new Response(JSON.stringify({ ok: true, message: "Code verified." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400, headers: corsHeaders });
    }

    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
    if (!user) {
      return new Response(JSON.stringify({ error: "User account not found." }), { status: 400, headers: corsHeaders });
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    await adminClient.from("password_reset_codes").delete().eq("id", record.id);

    return new Response(JSON.stringify({ ok: true, message: "Password updated successfully." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("reset-password error:", err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || "Failed to reset password. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
