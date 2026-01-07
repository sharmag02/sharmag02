import { useEffect, useState } from "react";
import { fetchAllProjects, Project } from "./ProjectAdminHelpers";
import { ExternalLink, Github } from "lucide-react";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchAllProjects().then(setProjects);
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((p) => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4">
          {p.thumbnail && (
            <img
              src={p.thumbnail}
              className="h-40 w-full object-cover rounded-lg mb-3"
            />
          )}

          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            {p.category.toUpperCase()}
          </span>

          <h3 className="font-bold mt-2">{p.title}</h3>
          <p className="text-gray-600 text-sm">{p.description}</p>

          <div className="flex gap-3 mt-3">
            {p.github && (
              <a href={p.github} target="_blank">
                <Github />
              </a>
            )}
            {p.live && (
              <a href={p.live} target="_blank">
                <ExternalLink />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
