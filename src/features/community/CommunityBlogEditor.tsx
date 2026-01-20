import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { Send, X } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import { useTheme } from "../../shared/context/ThemeContext";
import slugify from "../../shared/utils/slugify";
import { extractImagePaths } from "../../../shared/utils/extractImagePaths";
import { uploadToSupabase } from "../../shared/lib/SupabaseUploadAdapter";

/* ---------------- INVITE MODAL ---------------- */
function InviteModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-[350px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
          Invite Collaborator
        </h2>

        <input
          type="email"
          value={email}
          placeholder="Enter email"
          className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={() => onInvite(email)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMMUNITY BLOG EDITOR ---------------- */
export default function CommunityBlogEditor({
  blogId,
  onSave,
  onCancel = () => window.history.back(),
}) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { id } = useParams();
  const realBlogId = id || blogId || null;
  const isEditMode = Boolean(realBlogId);
  const isDark = theme === "dark";

  const editorRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [authorId, setAuthorId] = useState(null);

  const [submissionNote, setSubmissionNote] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [isCollaborator, setIsCollaborator] = useState(false);
  const [inviteAccepted, setInviteAccepted] = useState(true);

  const isAuthor = authorId === user?.id;

  /* ---------------- FETCH BLOG ---------------- */
  useEffect(() => {
    if (!realBlogId || !user?.id) return;

    const fetchBlog = async () => {
      const { data } = await supabase
        .from("community_blogs")
        .select("*")
        .eq("id", realBlogId)
        .single();

      if (data) {
        setTitle(data.title);
        setExcerpt(data.excerpt);
        setContent(data.content);
        setStatus(data.status);
        setAuthorId(data.author_id);
      }

      const { data: invite } = await supabase
        .from("blog_invitations")
        .select("accepted")
        .eq("blog_id", realBlogId)
        .eq("blog_type", "community")
        .eq("invited_user_id", user.id)
        .maybeSingle();

      if (invite) {
        setIsCollaborator(true);
        setInviteAccepted(invite.accepted);
      }
    };

    fetchBlog();
  }, [realBlogId, user?.id]);

  /* ---------------- SLUG GENERATOR ---------------- */
  const generateSlug = async (title) => {
    let base = slugify(title);
    let slug = base;
    let count = 1;

    while (true) {
      const { data } = await supabase
        .from("community_blogs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!data) break;
      slug = `${base}-${count++}`;
    }
    return slug;
  };

  /* ---------------- SEND INVITE ---------------- */
  const sendInvite = async (email) => {
    if (!email || !user?.id || !realBlogId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!profile) return alert("User not found");

    const token = crypto.randomUUID();

    const { error } = await supabase.from("blog_invitations").insert({
      blog_id: realBlogId,
      blog_type: "community",
      invited_email: email,
      invited_user_id: profile.id,
      invited_by: user.id,
      token,
    });

    if (error) {
      console.log("INVITE INSERT ERROR:", error);
      alert("Failed to create invitation");
      return;
    }

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "collaboration-invite",
        email,
        token,
        blogTitle: title,
        inviterName: user.email,
      }),
    });

    alert("Invitation email sent");
    setShowInviteModal(false);
  };

  /* ---------------- SUBMIT HANDLER ---------------- */
 const handleSubmit = async () => {
  if (!title || !content) return;

  if (isEditMode && !submissionNote.trim()) {
    alert("Submission note is required when updating a blog.");
    return;
  }

  setLoading(true);

  try {
    /* ---------------------------------------------------
       1️⃣ CREATE NEW BLOG
    --------------------------------------------------- */
    if (!isEditMode) {
      const slug = await generateSlug(title);

      const { error } = await supabase.from("community_blogs").insert({
        title,
        excerpt,
        content,
        slug,
        author_id: user.id,
        status: "submitted",
        submission_note: submissionNote,
      });

      if (error) throw error;

      // 🔥 Send email: FIRST SUBMIT
      const { data: session } = await supabase.auth.getSession();

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({
          type: "community-submitted",
          blogTitle: title,
          authorEmail: user.email,
        }),
      });

      alert("Blog submitted successfully");
      return navigate("/community-blogs");
    }

    /* ---------------------------------------------------
       2️⃣ UPDATE EXISTING BLOG
    --------------------------------------------------- */
    let nextStatus = status;

    if (status === "approved" || status === "rejected") {
      // 🔥 Approval/Rejection → Resubmitted
      nextStatus = "resubmitted";
    } 
    else if (status === "submitted") {
      // 🔥 Still submitted → NO EMAIL should be sent
      nextStatus = "submitted";
    }

    const { error: updateError } = await supabase
      .from("community_blogs")
      .update({
        title,
        excerpt,
        content,
        status: nextStatus,
        submission_note: submissionNote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", realBlogId);

    if (updateError) throw updateError;

    /* ---------------------------------------------------
       3️⃣ EMAIL LOGIC BASED ON STATUS
    --------------------------------------------------- */
    const { data: session } = await supabase.auth.getSession();

    // 🔥 RESUBMITTED → MAIL ADMIN
    if (nextStatus === "resubmitted") {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({
          type: "community-resubmitted",
          blogTitle: title,
          authorEmail: user.email,
          submissionNote,
        }),
      });
    }

    // 🔥 FRESH SUBMISSION (edit of draft?) → MAIL ADMIN
    if (nextStatus === "submitted" && status !== "submitted") {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({
          type: "community-submitted",
          blogTitle: title,
          authorEmail: user.email,
        }),
      });
    }

    alert("Changes submitted successfully");
    return navigate("/community-blogs");

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    alert("Update failed");
  } finally {
    setLoading(false);
  }
};


  /* ---------------- UI ---------------- */
 return (
  <div className="max-w-5xl mx-auto  rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-300 dark:border-slate-700 flex flex-col max-h-[85vh] mt-8 ">

    {/* COLLABORATION ALERT */}
    {isCollaborator && !inviteAccepted && (
      <div className="px-8 py-4 bg-yellow-100 border-b text-center dark:bg-yellow-200/20 dark:border-slate-700">
        <p className="font-medium mb-2 text-gray-900 dark:text-white">
          You were invited to collaborate on this blog.
        </p>

        <button
          onClick={() =>
            supabase
              .from("blog_invitations")
              .update({
                accepted: true,
                accepted_at: new Date().toISOString(),
              })
              .eq("blog_id", realBlogId)
              .eq("blog_type", "community")
              .eq("invited_user_id", user.id)
              .then(async () => {
                setInviteAccepted(true);
                await supabase.from("blog_collaborators").insert({
                  blog_id: realBlogId,
                  blog_type: "community",
                  user_id: user.id,
                });
              })
          }
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Accept Collaboration
        </button>
      </div>
    )}

    {/* HEADER */}
    <div className="flex items-center justify-between px-8 py-5 border-b border-gray-300 dark:border-slate-700 ">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {isEditMode ? "Edit Community Blog" : "Create Community Blog"}
      </h2>

      <div className="flex items-center gap-3">
        {isEditMode && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Invite
          </button>
        )}

        <button onClick={onCancel}>
          <X className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>

    {/* BODY */}
    <div className="p-8 space-y-6 flex-1 overflow-y-auto">

      {/* TITLE */}
      <input
        className="w-full text-2xl font-bold bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
        value={title}
        placeholder="Enter blog title"
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* EXCERPT */}
      <input
        className="w-full bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200"
        value={excerpt}
        placeholder="Short summary"
        onChange={(e) => setExcerpt(e.target.value)}
      />

      {/* CONTENT EDITOR */}
      <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-slate-700  jodit-theme ">
        <JoditEditor
          ref={editorRef}
          value={content}
          config={{
            height: 520,
            theme: isDark ? "dark" : "default",
            toolbarAdaptive: false,
            toolbarSticky: false,
           
            
       
            
            buttons: [
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "|",
              "superscript",
              "subscript",
              "|",
              "ul",
              "ol",
              "indent",
              "outdent",
              "|",
              "fontsize",
              "lineHeight",
              "brush",
              "paragraph",
              "align",
              "|",
              "link",
              "uploadImage",
              "video",
              "file",
              "table",
              "hr",
              "|",
              "symbols",
              "find",
              "|",
              "classSpan",
              "source",
              "|",
              "print",
              "undo",
              "redo",
              "preview",
              "fullsize",
            ],
            controls: {
              uploadImage: {
                icon: "image",
                tooltip: "Upload Image",
                exec: async (editor: any) => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";

                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;

                    try {
                      const url = await uploadToSupabase(file);
                      editor.selection.insertImage(url);
                    } catch (err) {
                      console.error(err);
                      alert("Image upload failed");
                    }
                  };

                  input.click();
                },
              },
            },
          }}
          onBlur={(v) => setContent(v)}
        />
      </div>

      {/* SUBMISSION NOTE */}
      {(isAuthor || isCollaborator) && isEditMode && (
        <textarea
          className="w-full p-3 border rounded-lg bg-transparent dark:bg-slate-800 dark:text-white border-gray-300 dark:border-slate-700"
          value={submissionNote}
          onChange={(e) => setSubmissionNote(e.target.value)}
          placeholder="Explain the changes made…"
        />
      )}
    </div>

    {/* FOOTER */}
    <div className="px-8 py-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-300 dark:border-slate-700 flex justify-end gap-3">
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-5 py-3 flex items-center gap-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-medium transition disabled:opacity-50"
      >
        <Send size={18} />
        {isCollaborator ? "Submit as Collaborator" : "Submit Changes"}
      </button>
    </div>

    {/* INVITE MODAL */}
    <InviteModal
      open={showInviteModal}
      onClose={() => setShowInviteModal(false)}
      onInvite={sendInvite}
    />
  </div>
);

}  