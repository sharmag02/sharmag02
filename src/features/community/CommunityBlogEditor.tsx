import { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { Send, X, MessageSquare } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import { useTheme } from "../../shared/context/ThemeContext";
import slugify from "../../shared/utils/slugify";
import { uploadToSupabase } from "../../shared/lib/SupabaseUploadAdapter";


interface Props {
  blogId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function CommunityBlogEditor({
  blogId,
  onSave,
  onCancel,
}: Props) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const editorRef = useRef<JoditEditor | null>(null);
  const isDark = theme === "dark";
  const isEditMode = Boolean(blogId);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [status, setStatus] = useState<
    "draft" | "submitted" | "approved" | "rejected" | "resubmitted"
  >("draft");

  const [submissionNote, setSubmissionNote] = useState("");

  /* ---------------- FETCH BLOG ---------------- */
  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("community_blogs")
        .select("*")
        .eq("id", blogId)
        .single();

      if (error) {
        alert("Failed to load blog");
      } else if (data) {
        setTitle(data.title);
        setExcerpt(data.excerpt);
        setContent(data.content);
        setStatus(data.status);
      }

      setLoading(false);
    };

    fetchBlog();
  }, [blogId]);

  /* ---------------- SLUG ---------------- */
  const generateSlug = async (title: string) => {
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

  /* ---------------- JODIT CONFIG (SAME AS BLOGEDITOR) ---------------- */
  const config = {
    readonly: false,
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
      "ul",
      "ol",
      "|",
      "fontsize",
      "brush",
      "paragraph",
      "align",
      "|",
      "link",
      "uploadImage",
      "video",
      "file",
      "|",
      "table",
      "hr",
      "|",
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
                         alert("Upload failed");
                       }
                     };

          input.click();
        },
      },
    },
  };

  /* ---------------- SUBMIT BLOG ---------------- */
  const handleSubmit = async () => {
    if (!title.trim()) return alert("Title is required");
    if (!content.trim()) return alert("Content is required");
    if (!user?.id) return alert("Login required");

    setLoading(true);

    try {
      /* ---------- CREATE ---------- */
      if (!isEditMode) {
        const slug = await generateSlug(title);

        const { error } = await supabase.from("community_blogs").insert({
          title,
          excerpt,
          content,
          slug,
          author_id: user.id,
          status: "submitted",
          is_edited: false,
          submission_note: null,
        });

        if (error) throw error;
        onSave();
        return;
      }

      /* ---------- UPDATE ---------- */
      let nextStatus = status;

      if (status === "approved" || status === "rejected") {
        if (!submissionNote.trim()) {
          setLoading(false);
          return alert("Please explain what you changed.");
        }
        nextStatus = "resubmitted";
      }

      const { error } = await supabase
        .from("community_blogs")
        .update({
          title,
          excerpt,
          content,
          status: nextStatus,
          is_edited: nextStatus === "resubmitted",
          submission_note:
            nextStatus === "resubmitted" ? submissionNote : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", blogId);

      if (error) throw error;
      onSave();
    } catch (err: any) {
      alert(err.message || "Failed to submit blog");
    }

    setLoading(false);
  };

  /* ---------------- UI (MATCHES BLOGEDITOR) ---------------- */
  return (
    <div className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-300 dark:border-slate-700 flex flex-col max-h-[85vh]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Community Blog" : "Create Community Blog"}
        </h2>
        <button onClick={onCancel}>
          <X className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* BODY */}
      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        <input
          className="w-full text-2xl font-bold bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full bg-transparent outline-none border-b border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200"
          placeholder="Short summary"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-slate-700 jodit-theme">
          <JoditEditor
            ref={editorRef}
            value={content}
            config={config}
            onBlur={(value) => setContent(value)}
          />
        </div>

        {(status === "approved" || status === "rejected") && (
          <div className="p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
            <div className="flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-300">
              <MessageSquare size={18} />
              <b>Explain what you changed</b>
            </div>

            <textarea
              rows={4}
              value={submissionNote}
              onChange={(e) => setSubmissionNote(e.target.value)}
              placeholder="Describe your updates"
              className="w-full p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-8 py-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-300 dark:border-slate-700 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 rounded-xl font-medium text-lg shadow-sm transition disabled:opacity-50"
        >
          <Send size={20} />
          {isEditMode ? "Submit Changes" : "Submit Blog"}
        </button>
      </div>
    </div>
  );
}
