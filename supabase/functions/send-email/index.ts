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

// Service role client
const adminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// For auth validation
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
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response("Forbidden: Admin only", {
        status: 403,
        headers: corsHeaders,
      });
    }

    /* ---------- FETCH PENDING EMAIL JOBS ---------- */
    const { data: jobs } = await adminClient
      .from("email_queue")
      .select("*")
      .eq("processed", false)
      .limit(5);

    if (!jobs?.length) {
      return new Response("No pending emails", { headers: corsHeaders });
    }

    /* ---------- FETCH SUBSCRIBERS ---------- */
    const { data: subscribers } = await adminClient
      .from("blog_subscribers")
      .select("email")
      .eq("is_active", true);

    if (!subscribers?.length) {
      return new Response("No subscribers", { headers: corsHeaders });
    }

    /* ---------- SEND EMAILS ---------- */
    for (const job of jobs) {
      for (const sub of subscribers) {
        await transporter.sendMail({
          from: `"Gaurav Kumar" <${Deno.env.get("GMAIL_USER")!}>`,
          to: sub.email,
          subject: `📝 New Blog Published: ${job.title}`,
          html: `
            <div style="
              font-family: Arial, Helvetica, sans-serif;
              background-color: #f4f6fb;
              padding: 30px;
            ">
              <div style="
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                border-radius: 12px;
                padding: 28px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08);
              ">

                <h1 style="
                  margin: 0 0 12px;
                  font-size: 26px;
                  color: #0f172a;
                ">
                  ${job.title}
                </h1>

                <p style="
                  font-size: 16px;
                  line-height: 1.6;
                  color: #334155;
                  margin-bottom: 26px;
                ">
                  ${job.excerpt || "A new blog has been published. Click below to read it."}
                </p>

                <a
                  href="${Deno.env.get("SITE_URL")}/blog/${job.slug}"
                  style="
                    display: inline-block;
                    background-color: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 26px;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                  "
                >
                  📖 Read Full Blog
                </a>

                <hr style="
                  margin: 32px 0;
                  border: none;
                  border-top: 1px solid #e5e7eb;
                " />

                <p style="
                  font-size: 14px;
                  color: #64748b;
                  margin-bottom: 14px;
                ">
                  Follow me for more tech blogs & updates:
                </p>

                <a
                  href="https://www.linkedin.com/in/sharmag02"
                  style="
                    display: inline-block;
                    background-color: #0a66c2;
                    color: white;
                    padding: 10px 18px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 14px;
                    margin-right: 10px;
                  "
                >
                  🔗 LinkedIn
                </a>

                <a
                  href="https://github.com/sharmag02"
                  style="
                    display: inline-block;
                    background-color: #111827;
                    color: white;
                    padding: 10px 18px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 14px;
                  "
                >
                  💻 GitHub
                </a>

                <p style="
                  margin-top: 36px;
                  font-size: 12px;
                  color: #94a3b8;
                ">
                  You received this email because you subscribed to blog updates.<br />
                  © ${new Date().getFullYear()} Gaurav Kumar
                </p>

              </div>
            </div>
          `,
        });
      }

      // mark job as processed
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
