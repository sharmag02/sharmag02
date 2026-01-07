// src/features/experience/ExperienceList.tsx
import { useEffect, useState } from "react";
import {
  fetchAllExperiences,
  deleteExperience,
  Experience,
} from "./ExperienceAdminHelpers";
import ExperienceEditor from "./editor/ExperienceEditor";
import { Edit, Trash2, Plus } from "lucide-react";

export default function ExperienceList() {
  const [list, setList] = useState<Experience[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const data = await fetchAllExperiences();
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <button onClick={() => setEditingId("new")}>
        <Plus /> Add
      </button>

      {editingId && (
        <ExperienceEditor
          experienceId={editingId === "new" ? null : editingId}
          onSave={() => {
            setEditingId(null);
            load();
          }}
          onCancel={() => setEditingId(null)}
        />
      )}

      {list.map((exp) => (
        <div key={exp.id} className="flex gap-4">
          <span>{exp.title}</span>
          <Edit onClick={() => setEditingId(exp.id!)} />
          <Trash2
            onClick={async () => {
              await deleteExperience(exp.id!);
              load();
            }}
          />
        </div>
      ))}
    </div>
  );
}
