import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  fetchSkills,
  deleteSkill,
  Skill,
} from "./SkillAdminHelpers";

export default function SkillList({
  onEdit,
}: {
  onEdit: (id: string) => void;
}) {
  const [skills, setSkills] = useState<Skill[]>([]);

  const load = async () => setSkills(await fetchSkills());

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-4">
      {skills.map((s) => (
        <div
          key={s.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow flex justify-between"
        >
          <div>
            <h3 className="font-bold">{s.title}</h3>
            <p className="text-sm text-gray-500">
              {s.category.toUpperCase()}
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => onEdit(String(s.id))}>
              <Edit />
            </button>
            <button
              onClick={async () => {
                if (!confirm("Delete this skill?")) return;
                await deleteSkill(String(s.id));
                load();
              }}
            >
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
