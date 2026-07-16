import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_USER = "yobest.bytr47@gmail.com";
const SMTP_PASS = "rwnjbedwmqqrysrj";

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

async function readAllLines(conn: Deno.TlsConn): Promise<string> {
  const decoder = new TextDecoder();
  let result = "";
  const buf = new Uint8Array(4096);
  let totalReads = 0;
  while (totalReads < 10) {
    const n = await Promise.race([
      conn.read(buf),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("read timeout")), 5000)),
    ]);
    if (n === null) break;
    result += decoder.decode(buf.subarray(0, n));
    const lines = result.split("\r\n");
    const lastLine = lines[lines.length - 2] || "";
    if (lastLine.length >= 4 && lastLine[3] === " ") break;
    totalReads++;
  }
  return result;
}

async function smtpCmd(conn: Deno.TlsConn, cmd: string): Promise<string> {
  const encoder = new TextEncoder();
  await conn.write(encoder.encode(cmd + "\r\n"));
  return await readAllLines(conn);
}

async function sendSmtpEmail(to: string, subject: string, htmlBody: string): Promise<string> {
  const conn = await Deno.connectTls({ hostname: SMTP_HOST, port: SMTP_PORT });

  try {
    let response = await readAllLines(conn);
    console.log("Banner:", response.trim());

    response = await smtpCmd(conn, "EHLO yobest.app");
    console.log("EHLO:", response.trim());

    response = await smtpCmd(conn, "AUTH LOGIN");
    console.log("AUTH LOGIN:", response.trim());

    response = await smtpCmd(conn, btoa(SMTP_USER));
    console.log("Username:", response.trim());

    response = await smtpCmd(conn, btoa(SMTP_PASS));
    console.log("Password:", response.trim());

    response = await smtpCmd(conn, `MAIL FROM:<${SMTP_USER}>`);
    console.log("MAIL FROM:", response.trim());

    response = await smtpCmd(conn, `RCPT TO:<${to}>`);
    console.log("RCPT TO:", response.trim());

    response = await smtpCmd(conn, "DATA");
    console.log("DATA:", response.trim());

    const encoder = new TextEncoder();
    const msg =
      `From: Yobest <${SMTP_USER}>\r\n` +
      `To: <${to}>\r\n` +
      `Subject: ${subject}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n` +
      `Content-Transfer-Encoding: 7bit\r\n` +
      `\r\n` +
      `${htmlBody}\r\n` +
      `.\r\n`;
    await conn.write(encoder.encode(msg));
    response = await readAllLines(conn);
    console.log("DATA response:", response.trim());

    response = await smtpCmd(conn, "QUIT");
    console.log("QUIT:", response.trim());

    return "ok";
  } finally {
    conn.close();
  }
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

      const smtpResult = await sendSmtpEmail(normalizedEmail, "Your Yobest Password Reset Code", buildEmailHtml(code));
      console.log("SMTP result:", smtpResult);

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
    console.error("reset-password error:", err);
    return new Response(JSON.stringify({ error: "Failed to reset password. Please try again." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
