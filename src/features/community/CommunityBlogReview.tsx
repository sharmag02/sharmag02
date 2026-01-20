import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";

interface Props {
  blogId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function CommunityBlogReview({ blogId, onSave, onCancel }: Props) {
  const [blog, setBlog] = useState<any>(null);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [processing, setProcessing] = useState(false);

  /* ---------------------------------------------------
     LOAD BLOG + AUTHOR DETAILS
  --------------------------------------------------- */
  useEffect(() => {
    const loadBlog = async () => {
      const { data, error } = await supabase
        .from("community_blogs")
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          status,
          admin_feedback,
          submission_note,
          created_at,
          updated_at,
          published_at,
          is_edited,
          profiles:profiles!community_blogs_author_id_fkey(
            full_name,
            email
          )
        `)
        .eq("id", blogId)
        .single();

      if (error) {
        console.error("Error loading blog:", error);
        return;
      }

      setBlog(data);
      setAdminFeedback(data?.admin_feedback || "");
    };

    loadBlog();
  }, [blogId]);

  /* ---------------------------------------------------
     APPROVE BLOG
  --------------------------------------------------- */
  const approveBlog = async () => {
    if (!blog || processing) return;
    setProcessing(true);

    try {
      const updates: any = {
        status: "approved",
        admin_feedback: adminFeedback || null,
        updated_at: new Date().toISOString(),
        submission_note: null,
      };

      const isFirstPublish = !blog.published_at;

      if (isFirstPublish) {
        updates.published_at = new Date().toISOString();
        updates.is_edited = false;
      } else {
        updates.is_edited = true;
      }

      const { error } = await supabase
        .from("community_blogs")
        .update(updates)
        .eq("id", blogId);

      if (error) throw error;
      /* ------------------------------
   SEND APPROVAL EMAIL TO USER
------------------------------ */
const { data: session } = await supabase.auth.getSession();

await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.session?.access_token}`,
  },
  body: JSON.stringify({
    type: "community-approved",
    userEmail: blog.profiles.email,
    blogTitle: blog.title,
   blogUrl: `${import.meta.env.VITE_SITE_URL}/community/${blog.slug}`,
 // ✅ send slug, not full URL
  }),
});



      /* ---------------------------------------------------
         EMAIL QUEUE + IMMEDIATE EDGE FUNCTION CALL
         (FIRST PUBLISH ONLY)
      --------------------------------------------------- */
      if (isFirstPublish) {
        try {
          const { error: queueError } = await supabase
            .from("email_queue")
            .insert({
              source: "community_blog",
              title: blog.title,
              excerpt: blog.excerpt,
              slug: blog.slug,
            });

          if (!queueError) {
            const { data: session } = await supabase.auth.getSession();

            await supabase.functions.invoke("send-email", {
              body: { type: "process-email-queue" },
              headers: {
                Authorization: `Bearer ${session?.session?.access_token}`,
              },
            });
          }
        } catch (emailErr) {
          console.error("❌ Email queue error:", emailErr);
        }
      }

      alert("Community blog approved successfully!");
      onSave();
    } catch (err: any) {
      console.error("Approve failed:", err);
      alert("Error approving blog. Check console.");
    } finally {
      setProcessing(false);
    }
  };

  /* ---------------------------------------------------
     REJECT BLOG
  --------------------------------------------------- */
  const rejectBlog = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from("community_blogs")
        .update({
          status: "rejected",
          admin_feedback: adminFeedback || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", blogId);

      if (error) throw error;
      /* ------------------------------
   SEND REJECTION EMAIL TO USER
------------------------------ */
const { data: session } = await supabase.auth.getSession();

await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.session?.access_token}`,
  },
  body: JSON.stringify({
    type: "community-rejected",
    userEmail: blog.profiles.email,
    blogTitle: blog.title,
    adminFeedback,
  }),
});



      alert("Blog rejected.");
      onSave();
    } catch (err: any) {
      alert("Failed to reject blog: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!blog) return <p className="text-center mt-20">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 
      shadow-xl border border-slate-300 dark:border-slate-700 flex flex-col max-h-[85vh]"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-700">
        <h2 className="text-xl font-semibold dark:text-white">Review Community Blog</h2>

        <button
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-300 text-xl"
          disabled={processing}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="p-8 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">{blog.title}</h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Author: {blog.profiles?.full_name || blog.profiles?.email}
          </p>

          <div className="flex gap-3 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              {blog.status.toUpperCase()}
            </span>

            {blog.is_edited && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                Resubmitted
              </span>
            )}
          </div>
        </div>

        {/* USER SUBMISSION NOTE */}
        {blog.submission_note && (
          <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 
            border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200"
          >
            <b>User resubmission note:</b>
            <p className="mt-1">{blog.submission_note}</p>
          </div>
        )}

        {/* CONTENT */}
        <div
          className="prose dark:prose-invert max-w-none border-t pt-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* ADMIN FEEDBACK */}
        <textarea
          rows={4}
          value={adminFeedback}
          onChange={(e) => setAdminFeedback(e.target.value)}
          placeholder="Feedback for the author (optional)"
          className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 
            border dark:border-slate-700"
        />
      </div>

      {/* FOOTER BUTTONS */}
      <div className="px-8 py-5 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
        <button
          onClick={rejectBlog}
          disabled={processing}
          className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
        >
          {processing ? "Processing…" : "Reject"}
        </button>

        <button
          onClick={approveBlog}
          disabled={processing}
          className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
        >
          {processing ? "Approving…" : "Approve"}
        </button>
      </div>
    </div>
  );
}
