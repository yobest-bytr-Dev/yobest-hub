import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No auth" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { table, id, fields } = await req.json();
  if (!table || !id || !fields) {
    return new Response(JSON.stringify({ error: "Missing table, id, or fields" }), { status: 400 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  if (table === "submissions") {
    const { data: sub, error: fetchErr } = await adminClient
      .from("submissions").select("user_id").eq("id", id).single();
    if (fetchErr || !sub) {
      return new Response(JSON.stringify({ error: "Record not found" }), { status: 404 });
    }
    if (sub.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }
  } else if (table === "experiences") {
    const { data: exp, error: fetchErr } = await adminClient
      .from("experiences").select("creator_id").eq("id", id).single();
    if (fetchErr || !exp) {
      return new Response(JSON.stringify({ error: "Record not found" }), { status: 404 });
    }
    if (exp.creator_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }
  } else {
    return new Response(JSON.stringify({ error: "Invalid table" }), { status: 400 });
  }

  const { error: updateError } = await adminClient
    .from(table).update(fields).eq("id", id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
