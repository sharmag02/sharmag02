// src/features/experience/editor/ExperienceEditor.tsx
import { useEffect, useState, KeyboardEvent } from "react";
import {
  Experience,
  addExperience,
  updateExperience,
  fetchExperienceById,
} from "../ExperienceAdminHelpers";
import { Save, X, Trash2 } from "lucide-react";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props {
  experienceId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ExperienceEditor({
  experienceId,
  onSave,
  onCancel,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState<Experience>({
    title: "",
    company: "",
    type: "industry",
    start_date: "",
    end_date: "",
    description: "",
    achievements: [],
    technologies: [],
  });

  const [achievementInput, setAchievementInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);

  useEffect(() => {
    if (!experienceId) return;
    fetchExperienceById(experienceId).then((data) => {
      if (data) {
        setForm(data);
        setCurrentlyWorking(data.end_date === "Present");
      }
    });
  }, [experienceId]);

  /* ---------------- ENTER HANDLERS ---------------- */
  function handleAchievementEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && achievementInput.trim()) {
      e.preventDefault();
      setForm({
        ...form,
        achievements: [...form.achievements, achievementInput.trim()],
      });
      setAchievementInput("");
    }
  }

  function handleTechEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault();
      setForm({
        ...form,
        technologies: [...form.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  }

  /* ---------------- SAVE ---------------- */
  async function handleSave() {
    const payload = {
      ...form,
      end_date: currentlyWorking ? "Present" : form.end_date,
    };

    experienceId
      ? await updateExperience(experienceId, payload)
      : await addExperience(payload);

    onSave();
  }

  const inputBase = isDark
    ? "bg-white/5 text-white placeholder-white/50 border border-white/10"
    : "bg-white text-gray-900 border border-gray-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={`w-full max-w-5xl rounded-xl shadow-2xl
        ${
          isDark
            ? "bg-gradient-to-b from-[#0f172a] to-[#020617]"
            : "bg-white"
        }`}
      >
        {/* HEADER */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b
          ${isDark ? "border-white/10 text-white" : "border-gray-200"}`}
        >
          <h2 className="text-xl font-semibold">
            {experienceId ? "Edit Experience" : "Add Experience"}
          </h2>
          <button
            onClick={onCancel}
            className={isDark ? "text-white/70" : "text-gray-600"}
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          {/* ROW 1 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={isDark ? "text-white/70" : "text-gray-600"}>
                Role / Title
              </label>
              <input
                className={`mt-2 w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className={isDark ? "text-white/70" : "text-gray-600"}>
                Company / Organization
              </label>
              <input
                className={`mt-2 w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className={isDark ? "text-white/70" : "text-gray-600"}>
                Experience Type
              </label>
              <select
                className={`mt-2 w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
              >
                <option value="industry">Industry</option>
                <option value="club">Club</option>
                <option value="career_break">Career Break</option>
              </select>
            </div>

            <div>
              <label className={isDark ? "text-white/70" : "text-gray-600"}>
                Start Date
              </label>
              <input
                type="month"
                className={`mt-2 w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>

            <div>
              <label className={isDark ? "text-white/70" : "text-gray-600"}>
                End Date
              </label>
              <input
                type="month"
                disabled={currentlyWorking}
                className={`mt-2 w-full rounded-lg px-4 py-3 outline-none disabled:opacity-50 ${inputBase}`}
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <label className={`flex items-center gap-2 ${isDark ? "text-white/70" : "text-gray-600"}`}>
            <input
              type="checkbox"
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
            />
            Currently working on this role
          </label>

          {/* DESCRIPTION */}
          <textarea
            rows={5}
            className={`w-full resize-none rounded-xl px-4 py-4 outline-none ${inputBase}`}
            placeholder="Describe your role, responsibilities, and impact..."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* ACHIEVEMENTS */}
          <input
            className={`w-full rounded-xl px-4 py-4 outline-none ${inputBase}`}
            placeholder="Press Enter to add achievement"
            value={achievementInput}
            onChange={(e) => setAchievementInput(e.target.value)}
            onKeyDown={handleAchievementEnter}
          />

          <div className="flex flex-wrap gap-2">
            {form.achievements.map((a, i) => (
              <span
                key={i}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm
                ${
                  isDark
                    ? "bg-blue-600/20 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {a}
                <Trash2
                  size={14}
                  className="cursor-pointer"
                  onClick={() =>
                    setForm({
                      ...form,
                      achievements: form.achievements.filter((_, idx) => idx !== i),
                    })
                  }
                />
              </span>
            ))}
          </div>

          {/* TECHNOLOGIES */}
          <input
            className={`w-full rounded-xl px-4 py-4 outline-none ${inputBase}`}
            placeholder="Press Enter to add technology"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechEnter}
          />

          <div className="flex flex-wrap gap-2">
            {form.technologies.map((t, i) => (
              <span
                key={i}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm
                ${
                  isDark
                    ? "bg-emerald-600/20 text-emerald-300"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {t}
                <Trash2
                  size={14}
                  className="cursor-pointer"
                  onClick={() =>
                    setForm({
                      ...form,
                      technologies: form.technologies.filter((_, idx) => idx !== i),
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
            className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg text-white hover:bg-blue-700"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
