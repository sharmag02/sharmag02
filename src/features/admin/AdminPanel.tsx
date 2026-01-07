import { useEffect, useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";

// Editors
import { BlogEditor } from "../blog/editor/BlogEditor";
import ProjectEditor from "../projects/editor/ProjectEditor";
import SkillEditor from "../skills/editor/SkillEditor";
import ExperienceEditor from "../experience/editor/ExperienceEditor";
import { CertificationEditor } from "../certifications/editor/CertificationEditor";

// Theme
import { useTheme } from "../../shared/context/ThemeContext";

type ContentType =
  | "blogs"
  | "projects"
  | "skills"
  | "experiences"
  | "certifications";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  excerpt?: string;
  created_at?: string;
  [key: string]: any;
}

export function AdminPanel() {
  const { theme } = useTheme();

  const [activeType, setActiveType] = useState<ContentType>("blogs");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const editorMap = {
    blogs: BlogEditor,
    projects: ProjectEditor,
    skills: SkillEditor,
    experiences: ExperienceEditor,
    certifications: CertificationEditor,
  } as const;

  const EditorComponent = editorMap[activeType];

  /* ---------------- LOAD DATA ---------------- */
  const loadItems = async () => {
    setLoading(true);
    try {
      let query = supabase.from(activeType).select("*");

      if (activeType === "blogs") {
        query = supabase
          .from(activeType)
          .select(`*, profiles(full_name,email)`);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setItems(data ?? []);
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

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await supabase.from(activeType).delete().eq("id", id);
    loadItems();
  };

  /* ---------------- SAVE CALLBACK ---------------- */
  const handleSave = () => {
    setEditingId(null);
    setIsCreating(false);
    loadItems();
  };

  /* ---------------- EDITOR VIEW ---------------- */
  if ((isCreating || editingId !== null) && EditorComponent) {
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
          {...(activeType === "projects" ? { projectId: editingId } : {})}
          {...(activeType === "skills" ? { skillId: editingId } : {})}
          {...(activeType === "experiences"
            ? { experienceId: editingId }
            : {})}
          {...(activeType === "certifications"
            ? { certId: editingId }
            : {})}
          onSave={handleSave}
          onCancel={() => {
            setEditingId(null);
            setIsCreating(false);
          }}
        />
      </div>
    );
  }

  /* ---------------- LIST VIEW ---------------- */
  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "light"
          ? "bg-gray-100"
          : "bg-gradient-to-br from-[#0f172a] to-[#020617]"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        {/* TABS */}
        <div className="flex gap-3 flex-wrap">
          {(
            [
              "blogs",
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
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-300
                ${
                  activeType === type
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : theme === "dark"
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => {
            setEditingId(null);
            setIsCreating(true);
          }}
          className="flex items-center px-6 py-3 rounded-lg font-semibold
            bg-blue-600 text-white
            hover:bg-blue-500
            shadow-lg shadow-blue-500/30
            transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          New{" "}
          {activeType
            .slice(0, -1)
            .replace(/^./, (c) => c.toUpperCase())}
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">
          No {activeType} yet
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-6 transition-all duration-300
                ${
                  theme === "light"
                    ? "bg-white shadow"
                    : "bg-slate-800/80 border border-slate-700 shadow-lg hover:shadow-blue-500/20"
                }
              `}
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

                  {item.description && (
                    <p
                      className={`mt-1 line-clamp-2 ${
                        theme === "dark"
                          ? "text-slate-400"
                          : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(item.id);
                    }}
                    className="p-2 rounded-lg transition
                      hover:bg-blue-100 dark:hover:bg-slate-700
                      text-blue-600 dark:text-blue-400"
                  >
                    <Edit />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg transition
                      text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
