import { useEffect, useState, KeyboardEvent } from "react";
import { Save, X, Trash2, Upload } from "lucide-react";
import { supabase } from "../../../shared/lib/supabase";
import {
  Project,
  addProject,
  updateProject,
  fetchProjectById,
} from "../ProjectAdminHelpers";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props {
  projectId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProjectEditor({
  projectId,
  onSave,
  onCancel,
}: Props) {
  const { theme } = useTheme();

  const [form, setForm] = useState<Project>({
    title: "",
    description: "",
    category: "web",
    tags: [],
    github: "",
    live: "",
    thumbnail: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    if (!projectId) return;
    fetchProjectById(projectId).then((data) => {
      if (data) setForm(data);
    });
  }, [projectId]);

  /* ---------------- TAG ENTER ---------------- */
  function handleTagEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  }

  /* ---------------- IMAGE UPLOAD ---------------- */
  async function uploadImage(file: File) {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const path = `projects/${fileName}`;

    const { error } = await supabase.storage
      .from("projects")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("projects")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((p) => ({ ...p, thumbnail: url }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  /* ---------------- SAVE ---------------- */
  async function handleSave() {
    projectId
      ? await updateProject(projectId, form)
      : await addProject(form);
    onSave();
  }

  /* ---------------- THEME CLASSES ---------------- */
  const modalBg =
    theme === "dark"
      ? "bg-gradient-to-b from-[#0f172a] to-[#020617]"
      : "bg-white";

  const inputClass =
    theme === "dark"
      ? "bg-white/5 text-white border-white/10"
      : "bg-gray-50 text-gray-900 border-gray-300";

  const textareaClass = inputClass;

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={`w-full max-w-5xl rounded-xl shadow-2xl ${modalBg}`}
      >
        {/* HEADER */}
        <div
          className={`flex justify-between px-6 py-4 border-b ${
            theme === "dark" ? "border-white/10" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {projectId ? "Edit Project" : "Add Project"}
          </h2>
          <button
            onClick={onCancel}
            className={theme === "dark" ? "text-white/60" : "text-gray-500"}
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          <input
            className={`w-full rounded-lg px-4 py-3 border focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            placeholder="Project title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            rows={5}
            className={`w-full rounded-lg px-4 py-3 border focus:ring-2 focus:ring-blue-500 ${textareaClass}`}
            placeholder="Project description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* CATEGORY */}
          <select
            className={`w-full rounded-lg px-4 py-3 border ${inputClass}`}
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as "core" | "web" })
            }
          >
            <option value="core">Core / Electronics</option>
            <option value="web">Web Development</option>
          </select>

          {/* TAG INPUT */}
          <input
            className={`w-full rounded-lg px-4 py-3 border ${inputClass}`}
            placeholder="Press Enter to add tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagEnter}
          />

          <div className="flex flex-wrap gap-2">
            {form.tags.map((t, i) => (
              <span
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  theme === "dark"
                    ? "bg-blue-600/20 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {t}
                <Trash2
                  size={14}
                  onClick={() =>
                    setForm({
                      ...form,
                      tags: form.tags.filter((_, idx) => idx !== i),
                    })
                  }
                  className="cursor-pointer"
                />
              </span>
            ))}
          </div>

          {/* LINKS */}
          <input
            className={`w-full rounded-lg px-4 py-3 border ${inputClass}`}
            placeholder="GitHub link"
            value={form.github}
            onChange={(e) => setForm({ ...form, github: e.target.value })}
          />

          <input
            className={`w-full rounded-lg px-4 py-3 border ${inputClass}`}
            placeholder="Live demo link"
            value={form.live}
            onChange={(e) => setForm({ ...form, live: e.target.value })}
          />

          {/* IMAGE */}
          <label
            className={`flex items-center gap-3 cursor-pointer ${
              theme === "dark" ? "text-white/70" : "text-gray-600"
            }`}
          >
            <Upload /> Upload thumbnail
            <input type="file" hidden onChange={handleFileChange} />
          </label>

          {form.thumbnail && (
            <img
              src={form.thumbnail}
              className="h-40 rounded-lg object-cover border"
            />
          )}
        </div>

        {/* FOOTER */}
        <div
          className={`flex justify-end gap-4 px-6 py-4 border-t ${
            theme === "dark" ? "border-white/10" : "border-gray-200"
          }`}
        >
          <button
            onClick={onCancel}
            className={theme === "dark" ? "text-white/70" : "text-gray-600"}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg text-white hover:bg-blue-700 transition"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
