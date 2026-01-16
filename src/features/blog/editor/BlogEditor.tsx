import { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { Save, X } from "lucide-react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../shared/context/AuthContext";
import { useTheme } from "../../../shared/context/ThemeContext";
import slugify from "../../../shared/utils/slugify";
import { extractImagePaths } from "../../../shared/utils/extractImagePaths";
import { uploadToSupabase } from "../../../shared/lib/SupabaseUploadAdapter";

interface BlogEditorProps {
  blogId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogEditor({ blogId, onSave, onCancel }: BlogEditorProps) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const editorRef = useRef<JoditEditor | null>(null);
  const isDark = theme === "dark";
  const isEditMode = Boolean(blogId);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const originalContentRef = useRef("");

  /* ---------------- FETCH BLOG ---------------- */
  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("blogs")
        .select("title, excerpt, content, status")
        .eq("id", blogId)
        .single();

      if (data) {
        setTitle(data.title);
        setExcerpt(data.excerpt);
        setContent(data.content);
        setStatus(data.status || "draft");
        originalContentRef.current = data.content;
      }

      setLoading(false);
    };

    fetchBlog();
  }, [blogId]);

  /* ---------------- SLUG ---------------- */
  const generateUniqueSlug = async (title: string) => {
    let base = slugify(title);
    let slug = base;
    let count = 1;

    while (true) {
      const { data } = await supabase
        .from("blogs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!data) break;
      slug = `${base}-${count++}`;
    }

    return slug;
  };

  // 🔗 Auto-embed helper (ONLY for pasted links)
const getEmbedHTML = (url: string) => {
  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (yt) {
    return `
      <iframe
        width="100%"
        height="420"
        src="https://www.youtube.com/embed/${yt[1]}"
        frameborder="0"
        allowfullscreen
      ></iframe>
    `;
  }

  // Google Drive (video / pdf)
  if (url.includes("drive.google.com")) {
    const fileId = url.match(/\/d\/([^/]+)/)?.[1];
    if (fileId) {
      return `
        <iframe
          src="https://drive.google.com/file/d/${fileId}/preview"
          width="100%"
          height="500"
        ></iframe>
      `;
    }
  }

  // Image links
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return `<img src="${url}" alt="" />`;
  }

  // PDF links
  if (url.match(/\.pdf$/i)) {
    return `<iframe src="${url}" width="100%" height="500"></iframe>`;
  }

  // Fallback → normal link
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
};


  /* ---------------- JODIT CONFIG ---------------- */
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

  /* ---------------- SAVE BLOG (DRAFT / PUBLISH) ---------------- */
  const handleSave = async (saveStatus: "draft" | "published") => {
    if (!title.trim() || !user?.id) return;
    setLoading(true);

    try {
      // Remove deleted images
      const oldImgs = extractImagePaths(originalContentRef.current);
      const newImgs = extractImagePaths(content);
      const removed = oldImgs.filter((img) => !newImgs.includes(img));

      if (removed.length > 0) {
        await supabase.storage.from("blog_images").remove(removed);
      }

      let finalSlug: string | undefined;

      if (isEditMode && blogId) {
        // 🔥 FETCH EXISTING SLUG (CRITICAL FIX)
        const { data } = await supabase
          .from("blogs")
          .select("slug")
          .eq("id", blogId)
          .single();

        finalSlug = data?.slug;

        await supabase
          .from("blogs")
          .update({
            title,
            excerpt,
            content,
            status: saveStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", blogId);
      } else {
        finalSlug = await generateUniqueSlug(title);

        await supabase.from("blogs").insert({
          title,
          excerpt,
          content,
          slug: finalSlug,
          author_id: user.id,
          status: saveStatus,
        });
      }

      /* ---------- EMAIL QUEUE (PUBLISH ONLY) ---------- */
      if (saveStatus === "published" && finalSlug) {
        const { error } = await supabase.from("email_queue").insert({
          title,
          excerpt,
          slug: finalSlug,
        });

        if (error) {
          console.error("Email queue insert failed:", error);
        } else {
          await supabase.functions.invoke("send-email", { body: {} });
        }
      }

      onSave();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving.");
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-300 dark:border-slate-700 flex flex-col max-h-[85vh]">
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Blog" : "Create Blog"}
        </h2>
        <button onClick={onCancel}>
          <X className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* BODY */}
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
            config={config}
            onBlur={(value) => setContent(value)}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-8 py-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-300 dark:border-slate-700 flex justify-end gap-3">
        <button
          onClick={() => handleSave("draft")}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-medium transition disabled:opacity-50"
        >
          Save Draft
        </button>

        <button
          onClick={() => handleSave("published")}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 rounded-xl font-medium text-lg shadow-sm transition disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? "Saving…" : isEditMode ? "Update & Publish" : "Publish Blog"}
        </button>
      </div>
    </div>
  );
}
