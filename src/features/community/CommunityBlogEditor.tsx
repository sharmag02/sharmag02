import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { Send, X } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import { useTheme } from "../../shared/context/ThemeContext";
import slugify from "../../shared/utils/slugify";
import { uploadToSupabase } from "../../shared/lib/SupabaseUploadAdapter";

/* ====================================================================== */
/* --------------------------- TYPES ------------------------------------ */
/* ====================================================================== */

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
}

interface SubmissionNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  note: string;
  setNote: (v: string) => void;
  loading: boolean;
  buttonText: string;
}

interface CommunityBlogEditorProps {
  blogId?: string | null;
  onSave?: () => void;
  onCancel?: () => void;
}

interface BlogRow {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  author_id: string;
  status: string;
  submission_note: string | null;
}

/* ====================================================================== */
/* --------------------------- INVITE MODAL ------------------------------ */
/* ====================================================================== */

function InviteModal({ open, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  if (!open) return null;

  const handleSend = async () => {
    if (!email) return;

    setSending(true);

    try {
      await onInvite(email);
    } finally {
      setSending(false);
    }
  };

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
            disabled={sending}
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={sending}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition 
              ${sending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {sending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}

            {sending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* ---------------------- SUBMISSION NOTE MODAL -------------------------- */
/* ====================================================================== */

function SubmissionNoteModal({ open, onClose, onSubmit, note, setNote, loading, buttonText }: SubmissionNoteModalProps)
 {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-[420px] bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Submit Changes
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
          Please explain the changes you made.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg bg-transparent dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600"
          placeholder="Describe what was updated..."
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-slate-600"
          >
            Cancel
          </button>

          <button
  onClick={onSubmit}
  disabled={loading}
  className={`px-4 py-2 rounded-lg text-white transition 
    ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
  `}
>
 {buttonText}
</button>

        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* ----------------------- COMMUNITY BLOG EDITOR ------------------------- */
/* ====================================================================== */

export default function CommunityBlogEditor({
  blogId,
  onSave,
  onCancel = () => window.history.back(),
}: CommunityBlogEditorProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { id } = useParams();
  const realBlogId = (id as string) || blogId || null;
  const isEditMode = Boolean(realBlogId);
  const isDark = theme === "dark";

  const editorRef = useRef<JoditEditor | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<string>("draft");
  const [authorId, setAuthorId] = useState<string | null>(null);

  const [submissionNote, setSubmissionNote] = useState<string>("");
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);

  const [isCollaborator, setIsCollaborator] = useState<boolean>(false);
  const [inviteAccepted, setInviteAccepted] = useState<boolean>(true);

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
        setSubmissionNote(data.submission_note || "");
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
  const generateSlug = async (title: string): Promise<string> => {
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
  const sendInvite = async (email: string): Promise<void> => {
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
      console.log("INVITE ERROR:", error);
      alert("Failed to invite");
      return;
    }

    const { data: session } = await supabase.auth.getSession();

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
      body: JSON.stringify({
        type: "collaboration-invite",
        email,
        token,
        blogTitle: title,
        inviterName: user.email,
      }),
    });

    alert("Invitation sent");
    setShowInviteModal(false);
  };

  /* ---------------- SUBMIT HANDLER ---------------- */
  const finalSubmit = async (): Promise<void> => {
    if (!title || !content) return;

   // Require submission note ONLY if resubmitting
if (
  isEditMode &&
  (status === "approved" || status === "rejected") &&
  !submissionNote.trim()
) {
  alert("Submission note is required for resubmission.");
  return;
}


    setLoading(true);

    try {
      /* ---------- CREATE NEW BLOG ---------- */
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

        alert("Blog submitted");
        return navigate("/blog");
      }

      /* ---------- UPDATE BLOG ---------- */
      let nextStatus = status;

      if (status === "approved" || status === "rejected") {
        nextStatus = "resubmitted";
      }
      // If resubmission happens → send email to admin
let shouldSendResubmissionEmail = false;

if (status === "approved" || status === "rejected") {
  shouldSendResubmissionEmail = true;
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

      // Send resubmission email to admin
if (shouldSendResubmissionEmail) {
  const { data: session } = await supabase.auth.getSession();

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
      note: submissionNote,
    }),
  });
}

      alert("Changes submitted");
      return navigate("/blog");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const openNoteModal = () => setShowNoteModal(true);

  const getSubmitButtonText = () => {
  if (!isEditMode) {
    return loading ? "Submitting Your Blog..." : "Submit Your Blog";
  }

  if (isCollaborator) {
    return loading ? "Submitting Collaboration..." : "Submit as Collaborator";
  }

  return loading ? "Submitting Changes..." : "Submit Changes";
};

  /* ---------------- UI ---------------- */
  return (
    <div
      className="
      min-h-screen 
      bg-white 
      dark:bg-gradient-to-br 
      dark:from-[#0B1220] 
      dark:to-[#050A18]
      py-10
    "
    >
      <div className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-300 dark:border-slate-700 flex flex-col max-h-[90vh]">
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

        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-300 dark:border-slate-700">
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

        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          <input
            className="w-full text-2xl font-bold bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
            value={title}
            placeholder="Enter blog title"
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200"
            value={excerpt}
            placeholder="Short summary"
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-slate-700 jodit-theme">
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

                        const url = await uploadToSupabase(file);
                        editor.selection.insertImage(url);
                      };
                      input.click();
                    },
                  },
                },
              }}
              onBlur={(v) => setContent(v)}
            />
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-300 dark:border-slate-700 flex justify-end gap-3">
        <button
  onClick={() => {
    if (!isEditMode) {
      finalSubmit();
      return;
    }
    openNoteModal();
  }}
  disabled={loading}
  className="px-5 py-3 flex items-center gap-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-medium transition disabled:opacity-50"
>
  <Send size={18} />
  {getSubmitButtonText()}
</button>


        </div>

        <InviteModal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={sendInvite}
        />

        <SubmissionNoteModal
          open={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onSubmit={finalSubmit}
          note={submissionNote}
          setNote={setSubmissionNote}
          loading={loading}
           buttonText={getSubmitButtonText()}
        />
      </div>
    </div>
  );
}
