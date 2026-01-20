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
   EMAIL TEMPLATES (UPDATED – LOGIC UNCHANGED)
--------------------------------------------------------- */

function baseTemplate(title: string, content: string, action?: { text: string; link: string }) {
  return `
  <div style="background:#f1f5f9;padding:32px;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:640px;margin:auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.08);">

      <div style="background:#0f172a;padding:24px;text-align:center;">
        <h1 style="margin:0;color:white;font-size:22px;">${title}</h1>
      </div>

      <div style="padding:28px;color:#1e293b;font-size:16px;line-height:1.7;">
        ${content}

        ${
          action
            ? `<div style="margin-top:28px;text-align:center;">
                <a href="${action.link}"
                  style="background:#2563eb;color:white;padding:14px 28px;
                  border-radius:10px;font-weight:600;text-decoration:none;">
                  ${action.text}
                </a>
              </div>`
            : ""
        }
      </div>

      <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:18px;text-align:center;">
        <p style="margin:0 0 10px;font-size:14px;color:#475569;">Connect with Gaurav Kumar</p>

        <div style="margin-bottom:10px;">
          <a href="https://linkedin.com/in/sharmag02" style="margin:0 8px;color:#2563eb;">LinkedIn</a>
          <a href="https://github.com/sharmag02" style="margin:0 8px;color:#111827;">GitHub</a>
          <a href="https://sharmag02.netlify.app" style="margin:0 8px;color:#2563eb;">Website</a>
        </div>

        <p style="margin:0;font-size:12px;color:#64748b;">
          contact.sharmag02@gmail.com
        </p>
      </div>
    </div>
  </div>
  `;
}

/* ---------- INVITE TEMPLATE ---------- */
function inviteTemplate(inviter: string, blogTitle: string, inviteLink: string) {
  return baseTemplate(
    "Collaboration Invitation",
    `
      <p><strong>${inviter}</strong> invited you to collaborate on:</p>
      <p style="font-size:18px;font-weight:600;">${blogTitle}</p>
    `,
    { text: "Accept Invitation", link: inviteLink }
  );
}

/* ---------- ADMIN SUBMISSION ---------- */
function adminSubmissionTemplate(title: string, author: string) {
  return baseTemplate(
    "New Community Blog Submitted",
    `
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Author:</strong> ${author}</p>
      <p>Please review this blog in the admin dashboard.</p>
    `,
    { text: "Open Dashboard", link: `${SITE_URL}/admin` }
  );
}

/* ---------- ADMIN RESUBMISSION ---------- */
function adminResubmissionTemplate(title: string, author: string, note?: string) {
  return baseTemplate(
    "Community Blog Resubmitted",
    `
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Author:</strong> ${author}</p>
      <p><strong>Submission Note:</strong></p>
      <blockquote style="background:#f1f5f9;padding:12px;border-left:4px solid #2563eb;">
        ${note || "No additional note provided"}
      </blockquote>
    `,
    { text: "Review Changes", link: `${SITE_URL}/admin` }
  );
}

/* ---------- USER REJECTION ---------- */
function rejectionTemplate(title: string, feedback: string) {
  return baseTemplate(
    "Your Blog Was Rejected",
    `
      <p>Your blog <strong>${title}</strong> requires changes.</p>
      <p><strong>Admin Feedback:</strong></p>
      <blockquote style="background:#fff1f2;padding:12px;border-left:4px solid #ef4444;">
        ${feedback}
      </blockquote>
    `
  );
}

/* ---------- USER APPROVAL ---------- */
function approvalTemplate(title: string, slug: string) {
  return baseTemplate(
    "Your Blog Is Published 🎉",
    `
      <p>Congratulations! Your blog <strong>${title}</strong> is now live.</p>
    `,
    { text: "Read Blog", link: `${SITE_URL}/community/${slug}` }
  );
}

/* ---------------------------------------------------------
   HELPERS (UNCHANGED)
--------------------------------------------------------- */
async function sendAdminMail(subject: string, html: string) {
  await transporter.sendMail({
    from: `"Community Blog" <${Deno.env.get("GMAIL_USER")!}>`,
    to: Deno.env.get("ADMIN_EMAIL") || Deno.env.get("GMAIL_USER")!,
    subject,
    html,
  });
}

async function sendUserMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"Gaurav Kumar" <${Deno.env.get("GMAIL_USER")!}>`,
    to,
    subject,
    html,
  });
}

/* ---------------------------------------------------------
   SERVER (LOGIC UNCHANGED)
--------------------------------------------------------- */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await anonClient.auth.getUser(token);

  if (error || !user) {
    return new Response("Invalid token", { status: 401, headers: corsHeaders });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}

  /* ---------------- INVITE ---------------- */
  if (body.type === "collaboration-invite") {
    const link = `${SITE_URL}/invite/accept?token=${body.token}`;
    await sendUserMail(
      body.email,
      "You're invited to collaborate",
      inviteTemplate(body.inviterName, body.blogTitle, link)
    );
    return new Response("Invite sent", { headers: corsHeaders });
  }

  /* ---------------- SUBMITTED ---------------- */
  if (body.type === "community-submitted") {
    await sendAdminMail(
      "New Community Blog Submitted",
      adminSubmissionTemplate(body.blogTitle, body.authorEmail)
    );
    return new Response("Admin notified", { headers: corsHeaders });
  }

  /* ---------------- RESUBMITTED ---------------- */
  if (body.type === "community-resubmitted") {
    await sendAdminMail(
      "Community Blog Resubmitted",
      adminResubmissionTemplate(
        body.blogTitle,
        body.authorEmail,
        body.submissionNote
      )
    );
    return new Response("Admin notified", { headers: corsHeaders });
  }

  /* ---------------- REJECTED ---------------- */
  if (body.type === "community-rejected") {
    await sendUserMail(
      body.userEmail,
      "Your Blog Was Rejected",
      rejectionTemplate(body.blogTitle, body.adminFeedback)
    );
    return new Response("User notified", { headers: corsHeaders });
  }

  /* ---------------- APPROVED ---------------- */
  if (body.type === "community-approved") {
    await sendUserMail(
      body.userEmail,
      "Your Blog Is Published",
      approvalTemplate(body.blogTitle, body.blogSlug)
    );
    return new Response("User notified", { headers: corsHeaders });
  }

  return new Response("Invalid request", { status: 400, headers: corsHeaders });
});
