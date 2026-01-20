import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../../shared/lib/supabase";

// Editors
import BlogEditor from "../blog/editor/BlogEditor";
import ProjectEditor from "../projects/editor/ProjectEditor";
import SkillEditor from "../skills/editor/SkillEditor";
import ExperienceEditor from "../experience/editor/ExperienceEditor";
import { CertificationEditor } from "../certifications/editor/CertificationEditor";
import CommunityBlogReview from "../community/CommunityBlogReview";

// Theme
import { useTheme } from "../../shared/context/ThemeContext";

type ContentType =
  | "blogs"
  | "community_blogs"
  | "projects"
  | "skills"
  | "experiences"
  | "certifications";

export default function AdminPanel() {
  const { theme } = useTheme();

  const [activeType, setActiveType] = useState<ContentType>("blogs");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const editorMap = {
    blogs: BlogEditor,
    community_blogs: CommunityBlogReview,
    projects: ProjectEditor,
    skills: SkillEditor,
    experiences: ExperienceEditor,
    certifications: CertificationEditor,
  } as const;

  const EditorComponent = editorMap[activeType];

  /* ------------------ FETCH DATA ------------------ */
  const loadItems = async () => {
    setLoading(true);
    setOpenNoteId(null);

    try {
      let query;

      if (activeType === "blogs") {
        query = supabase.from("blogs").select(`
          id,
          title,
          status,
          published,
          is_edited,
          submission_note,
          co_authors,
          created_at,
          updated_at
        `);
      } else if (activeType === "community_blogs") {
        query = supabase.from("community_blogs").select(`
          id,
          title,
          status,
          submission_note,
          admin_feedback,
          is_edited,
          updated_at
        `);
      } else {
        query = supabase.from(activeType).select("*");
      }

      const orderColumn =
        activeType === "community_blogs" ? "updated_at" : "created_at";

      const { data, error } = await query.order(orderColumn, {
        ascending: false,
      });

      if (error) throw error;

      if (activeType === "blogs" && data?.length) {
        const blogIds = data.map((b) => b.id);

        const { data: collabs } = await supabase
          .from("blog_collaborators")
          .select("blog_id,user_id")
          .eq("blog_type", "blog")
          .in("blog_id", blogIds);

        const withCoAuthors = data.map((blog) => ({
          ...blog,
          coauthors:
            collabs
              ?.filter((c) => c.blog_id === blog.id)
              .map((c) => c.user_id) || [],
        }));

        setItems(withCoAuthors);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Error loading:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [activeType]);

  /* ------------------ DELETE ------------------ */
  const handleDelete = async (id: string) => {
    if (activeType === "community_blogs") return;
    if (!confirm("Are you sure?")) return;

    await supabase.from(activeType).delete().eq("id", id);
    loadItems();
  };

  /* ------------------ APPROVE BLOG ------------------ */
  const approveBlog = async (id: string) => {
    await supabase
      .from("blogs")
      .update({
        status: "published",
        published: true,
        is_edited: false,
        submission_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    loadItems();
  };

  /* ------------------ SAVE CALLBACK ------------------ */
  const handleSave = () => {
    setEditingId(null);
    setIsCreating(false);
    loadItems();
  };

  /* ------------------ EDITOR VIEW ------------------ */
  if ((isCreating || editingId) && EditorComponent) {
    return (
      <div
        className={`min-h-screen p-6 ${
          theme === "light"
            ? "bg-gray-100"
            : "bg-gradient-to-br from-[#0f172a] to-[#020617]"
        }`}
      >
        <EditorComponent
          key={editingId ?? "new"}
          {...(activeType === "blogs" ? { blogId: editingId } : {})}
          {...(activeType === "community_blogs" ? { blogId: editingId } : {})}
          {...(activeType === "projects" ? { projectId: editingId } : {})}
          {...(activeType === "skills" ? { skillId: editingId } : {})}
          {...(activeType === "experiences" ? { experienceId: editingId } : {})}
          {...(activeType === "certifications" ? { certId: editingId } : {})}
          onSave={handleSave}
          onCancel={() => {
            setEditingId(null);
            setIsCreating(false);
          }}
        />
      </div>
    );
  }

  /* ------------------ LIST UI ------------------ */
  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "light"
          ? "bg-gray-100"
          : "bg-gradient-to-br from-[#0f172a] to-[#020617]"
      }`}
    >
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="flex gap-3 flex-wrap">
          {(
            [
              "blogs",
              "community_blogs",
              "projects",
              "skills",
              "experiences",
              "certifications",
            ] as ContentType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setEditingId(null);
                setIsCreating(false);
              }}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                activeType === type
                  ? "bg-blue-600 text-white shadow-lg"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (activeType === "community_blogs") return;
            setEditingId(null);
            setIsCreating(true);
          }}
          className={`flex items-center px-6 py-3 rounded-lg font-semibold transition ${
            activeType === "community_blogs"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          New {activeType.replace("_", " ").slice(0, -1)}
        </button>
      </div>

      {/* CONTENT LIST */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-6 transition-all duration-200 flex flex-row ${
                theme === "light"
                  ? "bg-white border border-gray-300 shadow-md hover:shadow-xl hover:border-gray-400 hover:scale-[1.01]"
                  : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 shadow-lg hover:border-slate-500 hover:shadow-2xl hover:scale-[1.02]"
              }`}
            >
              {/* LEFT CONTENT */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>

                {/* STATUS BADGE */}
                {item.status && (
  <span
    className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold
      ${
        item.status === "draft"
          ? theme === "light"
            ? "bg-yellow-300 text-yellow-800"
            : "bg-yellow-500/20 text-yellow-300"
          : item.status === "submitted"
          ? theme === "light"
            ? "bg-blue-100 text-blue-800"
            : "bg-blue-500/20 text-blue-300"
          : item.status === "resubmitted"
          ? theme === "light"
            ? "bg-purple-100 text-purple-800"
            : "bg-purple-500/20 text-purple-300"
          : item.status === "rejected"
          ? theme === "light"
            ? "bg-red-100 text-red-800"
            : "bg-red-500/20 text-red-300"
          : theme === "light"
          ? "bg-green-300 text-green-700"
          : "bg-green-600/20 text-green-400"
      }`}
  >
    {item.status.toUpperCase()}
  </span>
)}


                {/* SUBMISSION NOTE */}
                {item.submission_note && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setOpenNoteId(openNoteId === item.id ? null : item.id)
                      }
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      {openNoteId === item.id ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      View Submission Note
                    </button>

                    {openNoteId === item.id && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-900/60 border border-slate-700 text-sm text-slate-200">
                        {item.submission_note}
                      </div>
                    )}
                  </div>
                )}

              
              </div>

              {/* RIGHT ACTIONS */}
              {/* ACTION BUTTONS INLINE */}
<div className="flex items-center gap-3 mt-3">
  <button
    onClick={() => setEditingId(item.id)}
  className="text-blue-600 hover:text-blue-700"
  >
    <Edit />
  </button>

  {activeType === "blogs" && item.status === "draft" && (
    <button
      onClick={() => approveBlog(item.id)}
      className="text-green-600 hover:text-green-700"
    >
      <CheckCircle />
    </button>
  )}

  {activeType !== "community_blogs" && (
    <button
      onClick={() => handleDelete(item.id)}
      className="text-red-600 hover:text-red-700"
    >
      <Trash2 />
    </button>
  )}
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
