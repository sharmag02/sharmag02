import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ---------------------------------------------------------
   CORS
--------------------------------------------------------- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ---------------------------------------------------------
   SUPABASE CLIENTS
--------------------------------------------------------- */
const adminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const anonClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

/* ---------------------------------------------------------
   MAILER
--------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Deno.env.get("GMAIL_USER")!,
    pass: Deno.env.get("GMAIL_PASS")!,
  },
});

/* ---------------------------------------------------------
   SITE URL
--------------------------------------------------------- */
const SITE_URL =
  Deno.env.get("SITE_URL") || "https://sharmag02.netlify.app";

/* ---------------------------------------------------------
   EMAIL TEMPLATES
--------------------------------------------------------- */

/* ---------- 1) Collaboration Invite Email Template ---------- */
function inviteTemplate(inviter: string, blogTitle: string, inviteLink: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 24px; background:#f6f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:24px;border-radius:12px;">

      <h2 style="color:#1e293b;margin-bottom:8px;">
        You've been invited to collaborate!
      </h2>

      <p style="color:#334155;font-size:15px;">
        <b>${inviter}</b> invited you to collaborate on:
      </p>

      <h3 style="color:#0f172a;">${blogTitle}</h3>

      <a href="${inviteLink}" 
        style="
          display:inline-block;margin-top:18px;background:#2563eb;
          padding:14px 26px;color:white;border-radius:10px;
          text-decoration:none;font-size:16px;font-weight:600;">
        Accept Collaboration
      </a>

      <hr style="margin:28px 0;border-top:1px solid #e5e7eb;" />

      <p style="color:#64748b;font-size:14px;margin-bottom:8px;">
        Connect with Gaurav Kumar:
      </p>

      <a href="https://linkedin.com/in/sharmag02" 
         style="background:#0a66c2;color:white;padding:10px 18px;
         border-radius:8px;text-decoration:none;margin-right:10px;">
        LinkedIn
      </a>

      <a href="https://github.com/sharmag02"
        style="background:#111827;color:white;padding:10px 18px;
        border-radius:8px;text-decoration:none;margin-right:10px;">
        GitHub
      </a>

      <a href="https://sharmag02.netlify.app"
        style="background:#2563eb;color:white;padding:10px 18px;
        border-radius:8px;text-decoration:none;">
        Portfolio
      </a>

      <p style="margin-top:28px;color:#94a3b8;font-size:12px;">
        Contact: contact.sharmag02@gmail.com
      </p>
    </div>
  </div>
  `;
}

/* ---------- 2) Blog Publish Email Template ---------- */
function blogTemplate(job: any, link: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 24px; background:#f6f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:24px;border-radius:12px;">

      <h1 style="margin:0 0 12px;color:#0f172a;font-size:26px;">
        ${job.title}
      </h1>

      <p style="color:#334155;font-size:16px;line-height:1.6;">
        ${job.excerpt || ""}
      </p>

      <a href="${link}" 
        style="
          display:inline-block;margin-top:20px;background:#2563eb;
          padding:14px 26px;color:white;border-radius:10px;
          text-decoration:none;font-size:16px;font-weight:600;">
        📖 Read Full Blog
      </a>

      <hr style="margin:28px 0;border-top:1px solid #e5e7eb;" />

      <p style="color:#64748b;font-size:14px;margin-bottom:8px;">
        Follow Gaurav Kumar:
      </p>

      <a href="https://linkedin.com/in/sharmag02"
        style="background:#0a66c2;color:white;padding:10px 18px;
        border-radius:8px;text-decoration:none;margin-right:10px;">
        LinkedIn
      </a>

      <a href="https://github.com/sharmag02"
        style="background:#111827;color:white;padding:10px 18px;
        border-radius:8px;text-decoration:none;margin-right:10px;">
        GitHub
      </a>

      <a href="https://sharmag02.netlify.app"
        style="background:#2563eb;color:white;padding:10px 18px;
        border-radius:8px;text-decoration:none;">
        Portfolio
      </a>

      <p style="margin-top:28px;color:#94a3b8;font-size:12px;">
        Contact: contact.sharmag02@gmail.com
      </p>
    </div>
  </div>
  `;
}

/* ---------------------------------------------------------
   SERVER
--------------------------------------------------------- */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  console.log("➡️ Incoming request:", body);

  /* ======================================================
     1) 🚀 COLLABORATION INVITE EMAIL
  ====================================================== */
  if (body.type === "collaboration-invite") {
    try {
      const inviteLink = `${SITE_URL}/invite/accept?token=${body.token}`;

      await transporter.sendMail({
        from: `"${body.inviterName}" <${Deno.env.get("GMAIL_USER")!}>`,
        to: body.email,
        subject: `You're Invited to Collaborate on “${body.blogTitle}”`,
        html: inviteTemplate(body.inviterName, body.blogTitle, inviteLink),
      });

      return new Response("Invite email sent", { headers: corsHeaders });
    } catch (err) {
      console.error("❌ Invite error:", err);
      return new Response("Invite error", { status: 500, headers: corsHeaders });
    }
  }

  /* ======================================================
     2) 📬 PROCESS EMAIL QUEUE (ADMIN ONLY)
  ====================================================== */
  if (body.type === "process-email-queue") {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await anonClient.auth.getUser(token);

    if (!user) {
      return new Response("Invalid user", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response("Forbidden", {
        status: 403,
        headers: corsHeaders,
      });
    }

    /* --- Fetch jobs --- */
    const { data: jobs } = await adminClient
      .from("email_queue")
      .select("*")
      .eq("processed", false)
      .limit(5);

    if (!jobs?.length) {
      return new Response("No pending emails", { headers: corsHeaders });
    }

    const { data: subscribers } = await adminClient
      .from("blog_subscribers")
      .select("email")
      .eq("is_active", true);

    if (!subscribers?.length) {
      return new Response("No subscribers", { headers: corsHeaders });
    }

    /* --- Send emails --- */
    for (const job of jobs) {
      const isCommunity = job.source === "community_blog";

      const link = isCommunity
        ? `${SITE_URL}/community/${job.slug}`
        : `${SITE_URL}/blog/${job.slug}`;

      const html = blogTemplate(job, link);

      for (const sub of subscribers) {
        await transporter.sendMail({
          from: `"Gaurav Kumar" <${Deno.env.get("GMAIL_USER")!}>`,
          to: sub.email,
          subject: isCommunity
            ? `🌐 New Community Blog: ${job.title}`
            : `📝 New Blog Published: ${job.title}`,
          html,
        });
      }

      await adminClient
        .from("email_queue")
        .update({ processed: true })
        .eq("id", job.id);
    }

    return new Response("Newsletter emails sent", {
      headers: corsHeaders,
    });
  }

  return new Response("Invalid request", {
    status: 400,
    headers: corsHeaders,
  });
});
