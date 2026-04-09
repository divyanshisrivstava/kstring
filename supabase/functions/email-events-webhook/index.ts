import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ResendEventPayload = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    bounce?: {
      type?: string;
    };
  };
};

const getRecipient = (payload: ResendEventPayload) => {
  const to = payload.data?.to;
  if (Array.isArray(to)) return to[0] ?? "";
  return to ?? "";
};

const getBounceStatus = (payload: ResendEventPayload) => {
  const type = (payload.type ?? "").toLowerCase();
  const bounceType = (payload.data?.bounce?.type ?? "").toLowerCase();
  if (type.includes("bounce")) return bounceType === "soft" ? "soft" : "hard";
  return "none";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const payload = (await req.json()) as ResendEventPayload;
    const targetEmail = getRecipient(payload);
    if (!targetEmail) {
      return new Response(JSON.stringify({ ignored: true, reason: "No target email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.rpc("record_email_delivery_event", {
      target_email: targetEmail,
      event_type: payload.type ?? "unknown",
      bounce_status: getBounceStatus(payload),
      provider: "resend",
      provider_event_id: payload.data?.email_id ?? null,
      payload,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
