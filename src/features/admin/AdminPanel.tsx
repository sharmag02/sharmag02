import { useEffect, useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
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

  /* ------------------ EDITOR MAP ------------------ */
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

    try {
      let query;

      if (activeType === "blogs") {
        query = supabase.from("blogs").select(`*, profiles(full_name,email)`);
      } else if (activeType === "community_blogs") {
        query = supabase
          .from("community_blogs")
          .select(
            `
            id,
            title,
            status,
            updated_at,
            published_at
          `
          );
      } else {
        query = supabase.from(activeType).select("*");
      }

      const orderColumn =
        activeType === "community_blogs" ? "updated_at" : "created_at";

      const { data, error } = await query.order(orderColumn, {
        ascending: false,
      });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(`Error loading ${activeType}:`, err);
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

    if (!confirm("Are you sure you want to delete this item?")) return;

    await supabase.from(activeType).delete().eq("id", id);
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

  /* ------------------ LIST MODE ------------------ */
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
        {/* Tabs */}
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
              className={`px-5 py-2 rounded-full font-semibold transition-all ${
                activeType === type
                  ? "bg-blue-600 text-white shadow-lg"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              {type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => {
            if (activeType === "community_blogs") return;
            setEditingId(null);
            setIsCreating(true);
          }}
          className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
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
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">
          No {activeType.replace("_", " ")} yet
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-6 ${
                theme === "light"
                  ? "bg-white shadow"
                  : "bg-slate-800/80 border border-slate-700"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h3>

                  {/* STATUS BADGE */}
                  {item.status && (
                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold
                        ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : item.status === "resubmitted"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="p-2 rounded-lg text-blue-600 dark:text-blue-400"
                  >
                    <Edit />
                  </button>

                  {activeType !== "community_blogs" && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500"
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
