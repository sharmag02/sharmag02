import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { useTheme } from "../../shared/context/ThemeContext";
import slugify from "../../shared/utils/slugify";

interface BlogCategoryManagerProps {
  categoryId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogCategoryManager({
  categoryId,
  onSave,
  onCancel,
}: BlogCategoryManagerProps) {
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD CATEGORY ---------------- */
  useEffect(() => {
    if (!categoryId) return;

    const loadCategory = async () => {
      const { data } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (data) {
        setName(data.name);
      }
    };

    loadCategory();
  }, [categoryId]);

  /* ---------------- SAVE CATEGORY ---------------- */
  const saveCategory = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slugify(name),
      };

      if (categoryId) {
        await supabase
          .from("blog_categories")
          .update(payload)
          .eq("id", categoryId);
      } else {
        await supabase
          .from("blog_categories")
          .insert(payload);
      }

      onSave();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      <div
        className={`
          rounded-2xl p-8 border shadow-xl
          ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-slate-800 border-slate-700"
          }
        `}
      >
        <div className="flex justify-between items-center mb-8">

          <h2
            className={`
              text-3xl font-bold
              ${
                theme === "light"
                  ? "text-gray-900"
                  : "text-white"
              }
            `}
          >
            {categoryId
              ? "Edit Blog Category"
              : "Create Blog Category"}
          </h2>

          <button
            onClick={onCancel}
            className="
              p-2 rounded-lg
              text-red-500
              hover:bg-red-500/10
              transition
            "
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6">

          <div>
            <label
              className={`
                block mb-2 font-semibold
                ${
                  theme === "light"
                    ? "text-gray-700"
                    : "text-slate-300"
                }
              `}
            >
              Category Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digital Electronics"
              className={`
                w-full p-4 rounded-xl border
                outline-none
                ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-slate-900 border-slate-700 text-white"
                }
              `}
            />
          </div>

          <div>
            <label
              className={`
                block mb-2 font-semibold
                ${
                  theme === "light"
                    ? "text-gray-700"
                    : "text-slate-300"
                }
              `}
            >
              Generated Slug
            </label>

            <div
              className={`
                p-4 rounded-xl border
                ${
                  theme === "light"
                    ? "bg-gray-100 border-gray-300 text-gray-700"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }
              `}
            >
              /{slugify(name || "category-name")}
            </div>
          </div>

          <div className="flex gap-4 pt-4">

            <button
              onClick={saveCategory}
              disabled={loading}
              className="
                flex items-center gap-2
                px-6 py-3 rounded-xl
                bg-blue-600
                hover:bg-blue-500
                text-white
                font-semibold
                transition-all duration-300
                hover:scale-105
                disabled:opacity-50
              "
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Category"}
            </button>

            <button
              onClick={onCancel}
              className="
                px-6 py-3 rounded-xl
                bg-red-600
                hover:bg-red-500
                text-white
                font-semibold
                transition-all duration-300
              "
            >
              Cancel
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}