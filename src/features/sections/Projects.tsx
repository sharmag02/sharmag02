// src/features/projects/Projects.tsx

import { useEffect, useRef, useState } from "react";
import { Github, ExternalLink, Cpu, Globe } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { NextPageArrow } from "../../shared/components/NextPageArrow";


type TabType = "core" | "web";

type ProjectItem = {
  id: number;
  title: string;
  description: string;
  category: string; // IMPORTANT: stored value from DB (not strict TabType)
  tags?: string[];
  github?: string;
  live?: string;
  thumbnail?: string;
  bg?: string;
  glow?: string;
};

/* ================= TYPE NORMALIZER ================= */
const normalizeType = (type: string): TabType => {
  const t = type?.toLowerCase?.() ?? "";

  if (t.includes("core")) return "core";
  if (t.includes("web")) return "web";

  // safe default so project never disappears
  return "core";
};

export function Projects() {
  const [activeTab, setActiveTab] = useState<TabType>("core");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const tabs = [
    { key: "core", label: "Core / Electronics", icon: <Cpu size={18} /> },
    { key: "web", label: "Web Development", icon: <Globe size={18} /> },
  ];

  /* ================= FETCH PROJECTS ================= */
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data ?? []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ================= INTERSECTION OBSERVER ================= */
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0", "scale-100");
            el.classList.remove("opacity-0", "translate-y-6", "scale-95");
          }
        });
      },
      { threshold: 0.12 }
    );

    observerRef.current = observer;

    const selector = `[data-proj-id^="${activeTab}-"]`;
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab, projects]);

  /* ================= CARD ================= */
  const renderCard = (proj: ProjectItem, uniqueId: string) => (
    <div
      data-proj-id={uniqueId}
      key={uniqueId}
      className={`group relative p-1 rounded-2xl transition-all duration-300
        opacity-0 translate-y-6 scale-95 ${proj.glow ?? ""}`}
    >
      <div
        className={`
          ${proj.bg ?? ""}
          rounded-2xl p-6
          transition-all duration-500
          transform group-hover:scale-105
          hover:shadow-[0_0_25px_#3b82f6]
          dark:hover:shadow-[0_0_25px_#3b82f6]
          bg-white dark:bg-gray-800
        `}
      >
        {/* Thumbnail */}
        {proj.thumbnail && (
          <div className="w-full h-48 overflow-hidden rounded-xl mb-4 shadow-md">
            <img
              src={proj.thumbnail}
              alt={proj.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {proj.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {proj.description}
        </p>

        {/* Tags */}
        {proj.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {proj.tags.map((tag, idx) => (
              <span
                key={idx}
                className="
                  px-3 py-1 text-sm rounded-full font-medium cursor-pointer
                  bg-white dark:bg-gray-700
                  text-gray-800 dark:text-gray-200
                  border border-gray-300 dark:border-gray-600
                  transition-all duration-300
                  hover:bg-blue-600 dark:hover:bg-blue-600
                  hover:text-white dark:hover:text-white
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 mt-3">
          {proj.github && (
            <a
              href={proj.github}
              target="_blank"
              className="
                flex items-center gap-2 px-4 py-2
                bg-black text-white rounded-xl font-medium
                hover:opacity-80 transition
              "
            >
              <Github size={18} /> GitHub
            </a>
          )}

          {proj.live && (
            <a
              href={proj.live}
              target="_blank"
              className="
                flex items-center gap-2 px-4 py-2
                bg-blue-600 text-white rounded-xl font-medium
                hover:opacity-80 transition
              "
            >
              <ExternalLink size={18} /> Live
            </a>
          )}
        </div>
      </div>
    </div>
  );

  /* ================= FILTERED PROJECTS (FIXED) ================= */
  const filteredProjects = projects.filter(
    (p) => normalizeType(p.category) === activeTab
  );

  /* ================= UI ================= */
  return (
    <section
      id="projects"
      className="relative min-h-screen py-6 px-6 bg-slate-50 dark:bg-gray-900"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Projects
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" />
        </div>

        {/* MOBILE TABS */}
        <div className="flex justify-center mb-4 lg:hidden border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`relative flex items-center gap-1 px-4 py-2 font-semibold transition-all ${
                activeTab === tab.key
                  ? "text-blue-600 dark:text-blue-400 after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-pink-500"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* DESKTOP TABS */}
        <div className="hidden lg:flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300 py-10">
            Loading projects...
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {filteredProjects.map((proj, idx) =>
              renderCard(proj, `${activeTab}-${idx}`)
            )}
          </div>
        )}
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
