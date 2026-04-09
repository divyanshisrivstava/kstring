import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const renderEmail = (jobType: string, email: string) => {
  switch (jobType) {
    case "revalidation_notice":
      return {
        subject: "KIIT Connect revalidation required",
        html: `<p>Hello,</p><p>Your KIIT Connect account for <strong>${email}</strong> needs revalidation. Please sign in again with your KIIT Google account to keep access active.</p>`,
      };
    case "restriction_notice":
      return {
        subject: "KIIT Connect access restricted",
        html: `<p>Hello,</p><p>Your KIIT Connect account has been restricted because revalidation was not completed in time. Sign in with your KIIT Google account to restore access.</p>`,
      };
    case "deletion_warning":
      return {
        subject: "KIIT Connect account scheduled for deletion",
        html: `<p>Hello,</p><p>Your KIIT Connect account is scheduled for deletion soon. If your KIIT email is still active, sign in again immediately with your KIIT Google account to restore the account.</p>`,
      };
    default:
      return {
        subject: "KIIT Connect account update",
        html: `<p>Hello,</p><p>Your KIIT Connect account has a lifecycle update.</p>`,
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "";

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: jobs, error: jobsError } = await supabase
      .from("lifecycle_email_jobs")
      .select("id, user_id, email, job_type")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(25);

    if (jobsError) throw jobsError;

    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const job of jobs ?? []) {
      try {
        const content = renderEmail(job.job_type, job.email);
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [job.email],
            subject: content.subject,
            html: content.html,
          }),
        });

        if (!resendResponse.ok) {
          throw new Error(await resendResponse.text());
        }

        const payload = await resendResponse.json();

        const { error: updateError } = await supabase
          .from("lifecycle_email_jobs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: payload?.id ?? null,
          })
          .eq("id", job.id);

        if (updateError) throw updateError;

        await supabase
          .from("profiles")
          .update({ last_email_sent_at: new Date().toISOString() })
          .eq("user_id", job.user_id);

        results.push({ id: job.id, status: "sent" });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await supabase
          .from("lifecycle_email_jobs")
          .update({
            status: "failed",
            failed_at: new Date().toISOString(),
            error_message: message,
          })
          .eq("id", job.id);
        results.push({ id: job.id, status: "failed", error: message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
