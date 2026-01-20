import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ---------------- CORS ---------------- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ---------------- RESPONSE ---------------- */
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

/* ---------------- SUPABASE ADMIN ---------------- */
const adminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/* ---------------- MAILER ---------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Deno.env.get("GMAIL_USER")!,
    pass: Deno.env.get("GMAIL_PASS")!,
  },
});

/* ---------------- TEMPLATE ---------------- */
function premiumTemplate({ heading, message, action }) {
  return `
  <div style="background:#f8fafc;padding:40px;font-family:Inter,Arial">
    <div style="max-width:640px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;
      box-shadow:0 20px 40px rgba(0,0,0,.08)">

      <!-- Header -->
      <div style="padding:28px 32px;border-bottom:1px solid #e5e7eb">
        <h2 style="margin:0;font-size:22px;color:#111827">${heading}</h2>
      </div>

      <!-- Content -->
      <div style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6">
        ${message}
        ${
          action
            ? `<div style="margin-top:28px">
                <a href="${action.link}" style="display:inline-block;
                  background:#111827;color:#fff;padding:14px 26px;border-radius:12px;
                  text-decoration:none;font-weight:600">${action.text}</a>
              </div>`
            : ""
        }
      </div>

      <!-- Footer -->
      <div style="padding:26px 32px;border-top:1px solid #e5e7eb;text-align:center">

        <!-- ICON ROW -->
        <div style="margin-bottom:16px">

          <a href="https://sharmag02.netlify.app" style="margin:0 10px">
            <img src="https://img.icons8.com/ios-filled/50/000000/domain.png"
              width="28" height="28" alt="Website" />
          </a>

          <a href="https://linkedin.com/in/sharmag02" style="margin:0 10px">
            <img src="https://img.icons8.com/ios-filled/50/0A66C2/linkedin.png"
              width="28" height="28" alt="LinkedIn" />
          </a>

          <a href="https://github.com/sharmag02" style="margin:0 10px">
            <img src="https://img.icons8.com/ios-glyphs/50/000000/github.png"
              width="28" height="28" alt="GitHub" />
          </a>

          <a href="mailto:contact.sharmag02@gmail.com" style="margin:0 10px">
            <img src="https://img.icons8.com/ios-filled/50/EA4335/gmail.png"
              width="28" height="28" alt="Gmail" />
          </a>

        </div>

        <!-- COPYRIGHT -->
        <div style="font-size:13px;color:#6b7280">
          © ${new Date().getFullYear()} Gaurav Kumar
        </div>

      </div>
    </div>
  </div>`;
}



/* ---------------- SEND EMAIL ---------------- */
async function sendMail(to, subject, html) {
  await transporter.sendMail({
    from: `"Gaurav Kumar" <${Deno.env.get("GMAIL_USER")!}>`,
    to,
    subject,
    html,
  });
}

/* ====================== SERVER ====================== */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    /* ---------- SIMPLE AUTH ---------- */
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing or invalid auth" }, 401);
    }

    const body = await req.json();

    /* ---------------- COLLAB INVITE ---------------- */
    if (body.type === "collaboration-invite") {
      await sendMail(
        body.email,
        "You're invited to collaborate ✨",
        premiumTemplate({
          heading: "You're invited as a collaborator",
          message: `<p><b>${body.inviterName}</b> invited you to co-author <b>${body.blogTitle}</b>.</p>
            <p>Join the collaboration and contribute your knowledge.</p>`,
          action: {
            text: "Accept Invitation",
            link: `${Deno.env.get("SITE_URL")}/invite/accept?token=${body.token}`,
          },
        })
      );
      return jsonResponse({ success: true });
    }

    /* ---------------- COMMUNITY SUBMITTED ---------------- */
    if (body.type === "community-submitted") {
      await sendMail(
        Deno.env.get("ADMIN_EMAIL")!,
        "New Community Blog Submitted",
        premiumTemplate({
          heading: "New community blog submitted",
          message: `<p><b>${body.blogTitle}</b> by ${body.authorEmail}</p>`,
          action: {
            text: "Review Submission",
            link: `${Deno.env.get("SITE_URL")}/admin`,
          },
        })
      );
      return jsonResponse({ success: true });
    }

    /* ---------------- COMMUNITY RESUBMITTED ---------------- */
    if (body.type === "community-resubmitted") {
      await sendMail(
        Deno.env.get("ADMIN_EMAIL")!,
        "Community Blog Resubmitted",
        premiumTemplate({
          heading: "Blog Resubmitted",
          message: `<p><b>${body.blogTitle}</b></p><blockquote>${body.submissionNote}</blockquote>`,
          action: {
            text: "Review Changes",
            link: `${Deno.env.get("SITE_URL")}/admin`,
          },
        })
      );
      return jsonResponse({ success: true });
    }

    /* ---------------- COMMUNITY REJECTED ---------------- */
    if (body.type === "community-rejected") {
      await sendMail(
        body.userEmail,
        "Your blog needs revision",
        premiumTemplate({
          heading: "Your blog needs changes",
          message: `<blockquote>${body.adminFeedback}</blockquote>`,
        })
      );
      return jsonResponse({ success: true });
    }

    /* ---------------- COMMUNITY APPROVED ---------------- */
    if (body.type === "community-approved") {
      await sendMail(
        body.userEmail,
        "Your blog is live 🎉",
        premiumTemplate({
          heading: "Your blog is published",
          message: `<p>${body.blogTitle}</p>`,
          action: {
            text: "Read Blog",
            link: `${Deno.env.get("SITE_URL")}/community/${body.blogSlug}`,
          },
        })
      );
      return jsonResponse({ success: true });
    }

    /* ---------------- EMAIL QUEUE ---------------- */
    if (body.type === "process-email-queue") {
      const { data: jobs } = await adminClient
        .from("email_queue")
        .select("*")
        .eq("processed", false)
        .limit(5);

      const { data: subs } = await adminClient
        .from("blog_subscribers")
        .select("email")
        .eq("is_active", true);

      for (const job of jobs || []) {
        for (const s of subs || []) {
          await sendMail(
            s.email,
            `New Blog: ${job.title}`,
            premiumTemplate({
              heading: job.title,
              message: job.excerpt,
              action: {
                text: "Read Blog",
                link:
                  job.source === "community_blog"
                    ? `${Deno.env.get("SITE_URL")}/community/${job.slug}`
                    : `${Deno.env.get("SITE_URL")}/blog/${job.slug}`,
              },
            })
          );
        }

        await adminClient
          .from("email_queue")
          .update({ processed: true })
          .eq("id", job.id);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Invalid request" }, 400);
  } catch (err) {
    console.error("FUNCTION ERROR:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
