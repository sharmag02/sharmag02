import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../shared/context/AuthContext";
import { Save, X } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import CustomEditor from "../../../ckeditor/CustomEditor";
import slugify from "../../../shared/utils/slugify";
import { extractImagePaths } from "../../../shared/utils/extractImagePaths";

/* ---------------- Upload Adapter ---------------- */
class SupabaseUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    const ext = file.name.split(".").pop();
    const path = `blog/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("blog_images")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) throw error;

    const { data } = supabase.storage.from("blog_images").getPublicUrl(path);

    return { default: data.publicUrl };
  }

  abort() {}
}

function SupabaseUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) =>
    new SupabaseUploadAdapter(loader);
}

/* ---------------- BlogEditor ---------------- */
interface BlogEditorProps {
  blogId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function BlogEditor({ blogId, onSave, onCancel }: BlogEditorProps) {
  const { user } = useAuth();
  const isEditMode = Boolean(blogId);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // 🔐 store original content for image diff
  const originalContentRef = useRef<string>("");

  /* ---------------- FETCH BLOG ---------------- */
  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("blogs")
        .select("title, excerpt, content")
        .eq("id", blogId)
        .single();

      if (data) {
        setTitle(data.title ?? "");
        setExcerpt(data.excerpt ?? "");
        setContent(data.content ?? "");
        originalContentRef.current = data.content ?? "";
      }

      setLoading(false);
    };

    fetchBlog();
  }, [blogId]);

  /* ---------------- SLUG ---------------- */
  const generateUniqueSlug = async (title: string) => {
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;

    while (true) {
      const { data } = await supabase
        .from("blogs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!data) break;
      slug = `${baseSlug}-${count++}`;
    }

    return slug;
  };

  /* ---------------- SAVE / UPDATE ---------------- */
  const handleSubmit = async () => {
    if (loading || !user?.id || !title.trim()) return;

    setLoading(true);

    try {
      /* 🔥 IMAGE CLEANUP LOGIC */
      const oldImages = extractImagePaths(originalContentRef.current);
      const newImages = extractImagePaths(content);

      const removedImages = oldImages.filter((img) => !newImages.includes(img));

      if (removedImages.length > 0) {
        await supabase.storage.from("blog_images").remove(removedImages);
      }

      /* SAVE BLOG */
      if (isEditMode && blogId) {
        await supabase
          .from("blogs")
          .update({
            title,
            excerpt,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", blogId);
      } else {
        const slug = await generateUniqueSlug(title);

        await supabase.from("blogs").insert({
          title,
          excerpt,
          content,
          slug,
          author_id: user.id,
          published: true,
        });

        await supabase.from("email_queue").insert({
          title,
          excerpt,
          slug,
        });

     await supabase.functions.invoke("send-email",{
      body:{},
     });

      }

      onSave();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the blog.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Blog" : "Create Blog"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <X className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Title */}
        <input
          className="w-full text-2xl font-bold bg-transparent outline-none
          border-b border-gray-300 dark:border-slate-600
          text-gray-900 dark:text-white"
          placeholder="Enter blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Excerpt */}
        <input
          className="w-full bg-transparent outline-none
          border-b border-gray-300 dark:border-slate-600
          text-gray-800 dark:text-gray-200"
          placeholder="Short summary of the blog"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        {/* CKEditor */}
        <div className="rounded-2xl overflow-hidden border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CKEditor
            editor={CustomEditor}
            data={content}
            onChange={(_, editor) => setContent(editor.getData())}
            config={{
              extraPlugins: [SupabaseUploadAdapterPlugin],
              image: {
                toolbar: [
                  "imageTextAlternative",
                  "toggleImageCaption",
                  "imageStyle:inline",
                  "imageStyle:block",
                  "imageStyle:side",
                ],
              },
            }}
          />
        </div>

        {/* Publish Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
          font-semibold bg-blue-600 hover:bg-blue-700 text-white
          disabled:opacity-60"
        >
          <Save size={18} />
          {loading ? "Saving..." : isEditMode ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </div>
  );
}
