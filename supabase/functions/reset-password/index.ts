import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  if (!email || !code) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = String(code).trim();

  try {
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
