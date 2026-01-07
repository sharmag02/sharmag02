import { useEffect, useState, KeyboardEvent } from "react";
import { X, Save, Trash2 } from "lucide-react";
import {
  Skill,
  addSkill,
  updateSkill,
  fetchSkillById,
} from "../SkillAdminHelpers";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props {
  skillId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function SkillEditor({
  skillId,
  onSave,
  onCancel,
}: Props) {
  const { theme } = useTheme();

  const [form, setForm] = useState<Skill>({
    title: "",
    category: "skill",
    items: [],
  });

  const [input, setInput] = useState("");

  /* ---------- LOAD ---------- */
  useEffect(() => {
    if (!skillId) return;
    fetchSkillById(skillId).then((data) => {
      if (data) setForm(data);
    });
  }, [skillId]);

  /* ---------- ENTER HANDLER ---------- */
  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      setForm({
        ...form,
        items: [...form.items, input.trim()],
      });
      setInput("");
    }
  }

  /* ---------- SAVE ---------- */
  async function handleSave() {
    if (!form.title || form.items.length === 0) {
      alert("Title and at least one item required");
      return;
    }

    try {
      skillId
        ? await updateSkill(skillId, form)
        : await addSkill(form);

      onSave();
    } catch (e) {
      console.error(e);
      alert("Failed to save skill");
    }
  }

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={`w-full max-w-3xl rounded-xl shadow-2xl
        ${
          isDark
            ? "bg-gradient-to-b from-[#0f172a] to-[#020617]"
            : "bg-white"
        }`}
      >
        {/* HEADER */}
        <div
          className={`flex justify-between items-center px-6 py-4 border-b
          ${isDark ? "border-white/10 text-white" : "border-gray-200"}`}
        >
          <h2 className="text-xl font-semibold">
            {skillId ? "Edit Skill Category" : "Add Skill Category"}
          </h2>
          <button
            onClick={onCancel}
            className={isDark ? "text-white/70" : "text-gray-600"}
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as any })
            }
            className={`w-full rounded-lg px-4 py-3 outline-none
              ${
                isDark
                  ? "bg-white/5 text-white border border-white/10"
                  : "bg-white border border-gray-300"
              }`}
          >
            <option value="skill">Skill</option>
            <option value="tool">Tool</option>
          </select>

          {/* TITLE */}
          <input
            className={`w-full rounded-lg px-4 py-3 outline-none
              ${
                isDark
                  ? "bg-white/5 text-white placeholder-white/50 border border-white/10"
                  : "bg-white border border-gray-300"
              }`}
            placeholder="Category title (e.g. Frontend)"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          {/* ITEM INPUT */}
          <input
            className={`w-full rounded-lg px-4 py-3 outline-none
              ${
                isDark
                  ? "bg-white/5 text-white placeholder-white/50 border border-white/10"
                  : "bg-white border border-gray-300"
              }`}
            placeholder="Press Enter to add item"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleEnter}
          />

          {/* ITEMS */}
          <div className="flex flex-wrap gap-2">
            {form.items.map((i, idx) => (
              <span
                key={idx}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm
                  ${
                    isDark
                      ? "bg-blue-600/20 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
              >
                {i}
                <Trash2
                  size={14}
                  className="cursor-pointer opacity-70 hover:opacity-100"
                  onClick={() =>
                    setForm({
                      ...form,
                      items: form.items.filter((_, x) => x !== idx),
                    })
                  }
                />
              </span>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={`flex justify-end gap-3 px-6 py-4 border-t
          ${isDark ? "border-white/10" : "border-gray-200"}`}
        >
          <button
            onClick={onCancel}
            className={isDark ? "text-white/70" : "text-gray-600"}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
