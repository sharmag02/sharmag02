import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ---------- CORS ---------- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ---------- CLIENTS ---------- */

// Service role → DB + email access
const adminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Anon client → JWT validation
const anonClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

/* ---------- MAIL ---------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Deno.env.get("GMAIL_USER")!,
    pass: Deno.env.get("GMAIL_PASS")!,
  },
});

/* ---------- SERVER ---------- */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    /* 🔐 REQUIRE JWT */
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    /* 🔐 VERIFY USER */
    const {
      data: { user },
      error: authErr,
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authErr || !user) {
      return new Response("Invalid user", {
        status: 401,
        headers: corsHeaders,
      });
    }

    /* 👑 ADMIN CHECK */
    const { data: profile, error: profileErr } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileErr || profile?.is_admin !== true) {
      return new Response("Forbidden: Admin only", {
        status: 403,
        headers: corsHeaders,
      });
    }

    /* ---------- FETCH QUEUE ---------- */
    const { data: jobs } = await adminClient
      .from("email_queue")
      .select("*")
      .eq("processed", false)
      .limit(5);

    if (!jobs || jobs.length === 0) {
      return new Response("No pending emails", { headers: corsHeaders });
    }

    /* ---------- FETCH SUBSCRIBERS ---------- */
    const { data: subscribers } = await adminClient
      .from("blog_subscribers")
      .select("email")
      .eq("is_active", true);

    if (!subscribers || subscribers.length === 0) {
      return new Response("No subscribers", { headers: corsHeaders });
    }

    /* ---------- SEND EMAILS ---------- */
    for (const job of jobs) {
      for (const sub of subscribers) {
        await transporter.sendMail({
          from: `"Gaurav Kumar" <${Deno.env.get("GMAIL_USER")!}>`,
          to: sub.email,
          subject: `New Blog: ${job.title}`,
          html: `
            <h2>${job.title}</h2>
            <p>${job.excerpt ?? ""}</p>
            <a href="https://sharmag02.netlify.app/blog/${job.slug}">
              Read full blog →
            </a>
          `,
        });
      }

      await adminClient
        .from("email_queue")
        .update({ processed: true })
        .eq("id", job.id);
    }

    return new Response("Emails sent", { headers: corsHeaders });
  } catch (err) {
    console.error("Email error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
