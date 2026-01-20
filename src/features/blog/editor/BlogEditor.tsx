import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { Save, X } from "lucide-react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../shared/context/AuthContext";
import { useTheme } from "../../../shared/context/ThemeContext";
import { extractImagePaths } from "../../../shared/utils/extractImagePaths";
import { uploadToSupabase } from "../../../shared/lib/SupabaseUploadAdapter";



/* ---------------- SLUG GENERATOR ---------------- */
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/* ---------------- SUBMISSION NOTE MODAL ---------------- */
function SubmissionNoteModal({ open, onClose, onSubmit }) {
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 p-6 rounded-xl w-[380px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Add Submission Note
        </h2>

        <textarea
          className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
          rows={4}
          placeholder="Describe what changes you made..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(note)}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

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

/* ---------------- MAIN EDITOR ---------------- */
export default function BlogEditor({ blogId, onSave, onCancel }) {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { id } = useParams();
  const realBlogId = id || blogId || null;

  const isDark = theme === "dark";
  const isEditMode = Boolean(realBlogId);

  const editorRef = useRef(null);
  const originalContentRef = useRef("");
  const originalSlugRef = useRef("");

  const wasPublishedRef = useRef(false);


  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [isCollaborator, setIsCollaborator] = useState(false);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);

  const isAdmin = profile?.is_admin === true;

  /* ---------------- FETCH BLOG ---------------- */
  useEffect(() => {
    if (!realBlogId || !user?.id) return;

    const load = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", realBlogId)
        .single();

    if (data) {
  setTitle(data.title);
  setExcerpt(data.excerpt);
  setContent(data.content);
  setStatus(data.status);
  originalContentRef.current = data.content;
  wasPublishedRef.current = data.published === true;
  originalSlugRef.current = data.slug;   // <-- ADD THIS
}

      const { data: collab } = await supabase
        .from("blog_collaborators")
        .select("id")
        .eq("blog_id", realBlogId)
        .eq("blog_type", "blog")
        .eq("user_id", user.id)
        .maybeSingle();

      if (collab) setIsCollaborator(true);

      const { data: invite } = await supabase
        .from("blog_invitations")
        .select("accepted")
        .eq("blog_id", realBlogId)
        .eq("blog_type", "blog")
        .eq("invited_user_id", user.id)
        .maybeSingle();

      if (invite && invite.accepted === false) {
        setHasPendingInvite(true);
      }
    };

    load();
  }, [realBlogId, user?.id]);

  /* ---------------- SEND INVITE ---------------- */
  const sendInvite = async (email) => {
    if (!email.trim() || !realBlogId || !user?.id) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    const invitedUserId = profile?.id || null;
    const token = crypto.randomUUID();

    await supabase.from("blog_invitations").insert({
      blog_id: realBlogId,
      blog_type: "blog",
      invited_email: email,
      invited_user_id: invitedUserId,
      invited_by: user.id,
      token,
    });

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

    alert("Invitation email sent!");
    setShowInviteModal(false);
  };

  /* ---------------- ACCEPT COLLAB INVITE ---------------- */
  const acceptInvite = async () => {
    if (!realBlogId || !user?.id) return;

    await supabase
      .from("blog_invitations")
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .eq("blog_id", realBlogId)
      .eq("blog_type", "blog")
      .eq("invited_user_id", user.id);

    await supabase.from("blog_collaborators").insert({
      blog_id: realBlogId,
      blog_type: "blog",
      user_id: user.id,
    });

    setIsCollaborator(true);
    setHasPendingInvite(false);
  };

/* ---------------- SAVE HANDLER ---------------- */
const handleSaveInternal = async (requestedStatus, submissionNote = null) => {
  setLoading(true);

  try {
    /* ---------------- CREATE NEW BLOG ---------------- */
    if (!isEditMode) {
      const slug = generateSlug(title);

      const { data, error } = await supabase
        .from("blogs")
        .insert({
          title,
          slug,
          excerpt,
          content,
          author_id: user.id,
          status: requestedStatus,
          published: requestedStatus === "published",
          is_edited: false,
          submission_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        alert(error.message);
        setLoading(false);
        return;
      }

      /* -------- EMAIL QUEUE (AUTO TRIGGER HANDLES SENDING) -------- */
   
const shouldSendEmailOnCreate =
  requestedStatus === "published" && wasPublishedRef.current === false;


if (shouldSendEmailOnCreate) {

  const { error: queueError } = await supabase.from("email_queue").insert({
    source: "blog",
    title,
    excerpt,
    slug: generateSlug(title),
  });

  if (!queueError) {
    const { data: session } = await supabase.auth.getSession();

    await supabase.functions.invoke("send-email", {
      body: { type: "process-email-queue" },
      headers: {
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
    });

    wasPublishedRef.current = true;   // IMPORTANT: Lock so email never sends again
  }
}


      alert("Blog created successfully!");
      onSave?.();
      navigate("/blog");
      return;
    }

    /* ---------------- REMOVE UNUSED IMAGES ---------------- */
    const oldImgs = extractImagePaths(originalContentRef.current);
    const newImgs = extractImagePaths(content);
    const removed = oldImgs.filter((img) => !newImgs.includes(img));

    if (removed.length) {
      await supabase.storage.from("blog_images").remove(removed);
    }

    /* ---------------- COLLABORATOR UPDATE ---------------- */
    if (isCollaborator) {
      const updateDataCollab = {
        title,
        excerpt,
        content,
        updated_at: new Date().toISOString(),
        status: "draft",
        published: false,
        is_edited: true,
        submission_note: submissionNote,
      };

      await supabase.from("blogs").update(updateDataCollab).eq("id", realBlogId);

      alert("Changes submitted (Draft created).");
      onSave?.();
      navigate("/blog");
      return;
    }

    /* ---------------- ADMIN UPDATE ---------------- */
    const updateDataAdmin = {
      title,
      excerpt,
      content,
      updated_at: new Date().toISOString(),
      status: requestedStatus,
      published: requestedStatus === "published",
      is_edited: false,
      submission_note: requestedStatus === "published" ? null : undefined,
    };

    await supabase.from("blogs").update(updateDataAdmin).eq("id", realBlogId);
    // Keep ref in sync with DB



    /* -------- EMAIL QUEUE (AUTO TRIGGER HANDLES SENDING) -------- */
    /* -------- EMAIL QUEUE + CALL EDGE FUNCTION -------- */
const shouldSendEmail =
  requestedStatus === "published" && wasPublishedRef.current === false;

if (shouldSendEmail) {
  const { error: queueError } = await supabase.from("email_queue").insert({
    source: "blog",
    title,
    excerpt,
   slug: originalSlugRef.current,

  });

  if (!queueError) {
    const { data: session } = await supabase.auth.getSession();

    await supabase.functions.invoke("send-email", {
      body: { type: "process-email-queue" },
      headers: {
        Authorization: `Bearer ${session?.session?.access_token}`,
      },
    });

    // VERY IMPORTANT: lock so email never sends again
    wasPublishedRef.current = true;
  }
}



    alert(
      requestedStatus === "published"
        ? "Blog published successfully"
        : "Blog saved successfully"
    );

    onSave?.();
    navigate("/blog");
  } catch (err) {
    console.error(err);
    alert("Save failed");
  }

  setLoading(false);
};



  /* ---------------- PUBLIC SAVE BUTTON ---------------- */
  const handleSave = (requestedStatus) => {
    if (hasPendingInvite) {
      alert("Accept invite first.");
      return;
    }

    if (isCollaborator) {
      setShowNoteModal(true);
    } else {
      handleSaveInternal(requestedStatus, null);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-300 dark:border-slate-700 flex flex-col max-h-[85vh] mt-8">
      {hasPendingInvite && (
        <div className="px-8 py-4 bg-yellow-100 border-b text-center">
          <p className="font-medium mb-2">You were invited to collaborate.</p>
          <button
            onClick={acceptInvite}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Accept Collaboration
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-700">
       <h2 className="text-xl font-semibold text-gray-900 dark:text-white">

          {isEditMode ? "Edit Blog" : "Create Blog"}
        </h2>

        <div className="flex items-center gap-3">
          {isEditMode && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
          className="w-full text-2xl font-bold bg-transparent outline-none
             border-b border-gray-300 dark:border-slate-600
             text-gray-900 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title"
        />

        <input
          className="w-full bg-transparent outline-none
             border-b border-gray-300 dark:border-slate-600
             text-gray-800 dark:text-gray-200"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary"
        />

        <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-slate-700 jodit-theme">
  <JoditEditor
    ref={editorRef}
    value={content}
    config={{
      readonly: false,
      height: 520,
      theme: isDark ? "dark" : "default",
      toolbarAdaptive: false,
      toolbarSticky: false,

      plugins: {
        lineHeight: true,
        indent: true,
        symbols: true,
        find: true,
        print: true,
        classSpan: true,
        source: true,
      },

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

      </div>

     <div className="px-8 py-5 bg-gray-50 dark:bg-slate-800/50
                border-t border-gray-300 dark:border-slate-700
                flex justify-end gap-3">
       <button
  onClick={() => handleSave("draft")}
  disabled={loading}
  className="px-5 py-3 rounded-xl bg-gray-500 hover:bg-gray-600
             text-white font-medium transition disabled:opacity-50"
>

          Save Draft
        </button>

        <button
  onClick={() => handleSave("published")}
  disabled={loading}
  className="flex items-center gap-2 px-6 py-3
             text-white bg-blue-600 hover:bg-blue-700
             dark:bg-blue-500 dark:hover:bg-blue-400
             rounded-xl font-medium text-lg shadow-sm
             transition disabled:opacity-50"
>
  <Save size={20} />
  {loading ? "Saving…" : isCollaborator ? "Submit (Draft Only)" : "Publish"}
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
        onSubmit={(note) => {
          setShowNoteModal(false);
          handleSaveInternal("draft", note);
        }}
      />
    </div>
  );
}
