// src/features/projects/Projects.tsx

import { useEffect, useState } from "react";
import { motion,  AnimatePresence } from "framer-motion";
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

 
 
  /* ================= CARD ================= */
  const renderCard = (proj: ProjectItem, uniqueId: string) => (
   <motion.div
  key={uniqueId}
  data-proj-id={uniqueId}
//   initial={{
//   opacity: 0,
//   y: 50,
// }}

// whileInView={{
//   opacity: 1,
//   y: 0,
// }}

// viewport={{
//   amount: 0.15,
//   once: false,
// }}

transition={{
  duration: 0.7,
  ease: "easeOut",
}}
  whileHover={{
    y: -4,
  }}
 
  className={`group relative p-1 rounded-2xl ${proj.glow ?? ""}`}
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
              <motion.span
                key={idx}
                whileHover={{
  scale: 1.08,
  y: -2,
}}

whileTap={{
  scale: 0.95,
}}
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
              </motion.span>
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
            <motion.a
            whileHover={{
  scale: 1.05,
  y: -2,
}}

whileTap={{
  scale: 0.95,
}}
              href={proj.live}
              target="_blank"
              className="
                flex items-center gap-2 px-4 py-2
                bg-blue-600 text-white rounded-xl font-medium
                hover:opacity-80 transition
              "
            >
              <ExternalLink size={18} /> Live
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );

  
const chunkProjects = (items: ProjectItem[], size = 2) => {
  const rows: ProjectItem[][] = [];

  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }

  return rows;
};
const coreRows = chunkProjects(
  projects.filter(
    (p) => normalizeType(p.category) === "core"
  )
);

const webRows = chunkProjects(
  projects.filter(
    (p) => normalizeType(p.category) === "web"
  )
);
if (loading) {
  return (
    <section
      id="projects"
      className="
        relative
        min-h-screen
        overflow-hidden
        py-6
        px-6
        bg-slate-50
        dark:bg-gray-900
      "
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Space */}
        <div className="h-[120px]" />

        {/* Project Cards Placeholder */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="h-[320px]" />
          <div className="h-[320px]" />
          <div className="h-[320px]" />
          <div className="h-[320px]" />
        </div>
      </div>
    </section>
  );
}
  /* ================= UI ================= */
  return (
    <section
      id="projects"
      className="relative
    min-h-screen
    overflow-hidden
    py-6
    px-6
    bg-slate-50
    dark:bg-gray-900"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
  className="text-center mb-12"
  initial={{ opacity: 0, y: -40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{amount: 0.3}}
  transition={{ duration: 0.8 }}
>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Projects
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" />
        </div>
        </motion.div>

  
       {/* ================= MOBILE TABS ================= */}
<div className="flex justify-center mb-4 lg:hidden border-b border-gray-200 dark:border-gray-700">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key as TabType)}
      className={`relative flex items-center gap-1 px-4 py-2 text-base font-semibold transition-colors duration-300 ${
        activeTab === tab.key
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
      }`}
    >
      {activeTab === tab.key && (
        <motion.div
          layoutId="projectsMobileTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-pink-500"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />
      )}

      <span className="relative z-10 flex items-center gap-1">
        {tab.icon}
        {tab.label}
      </span>
    </button>
  ))}
</div>

        {/* ================= DESKTOP TABS ================= */}
<div className="hidden lg:flex justify-center mb-6">
  <div className="relative bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-2">
    {tabs.map((tab) => (
      <div key={tab.key} className="relative">
        {activeTab === tab.key && (
          <motion.div
            layoutId="projectsDesktopTab"
            className="absolute inset-0 bg-blue-600 rounded-full"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
          />
        )}

        <button
          onClick={() => setActiveTab(tab.key as TabType)}
          className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold transition-all duration-300 ${
            activeTab === tab.key
              ? "text-white"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      </div>
    ))}
  </div>
</div>

        {/* Grid */}
        
          <AnimatePresence mode="wait">

 {/* CORE PROJECTS */}
{activeTab === "core" && (
  <motion.div
    key="core"
    className="flex flex-col gap-10"
    initial={{
      opacity: 0,
      x: 30,
    }}
    animate={{
      opacity: 1,
      x: 0,
    }}
    exit={{
      opacity: 0,
      x: -30,
    }}
    transition={{
      duration: 0.35,
    }}
  >
    {/* MOBILE */}
<div className="md:hidden flex flex-col gap-10">
  {projects
    .filter((p) => normalizeType(p.category) === "core")
    .map((proj, idx) => (
      <motion.div
        key={`core-mobile-${idx}`}
        initial={{
          opacity: 0,
          y: 50,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          amount: 0.15,
          once: false,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
      >
        {renderCard(
          proj,
          `core-mobile-${idx}`
        )}
      </motion.div>
    ))}
</div>

{/* DESKTOP */}
<div className="hidden md:flex flex-col gap-10">
  {coreRows.map((row, rowIndex) => (
    <motion.div
      key={`core-row-${rowIndex}`}
      className="grid md:grid-cols-2 gap-10"
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        amount: 0.15,
        once: false,
      }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
    >
      {row.map((proj, idx) =>
        renderCard(
          proj,
          `core-${rowIndex}-${idx}`
        )
      )}
    </motion.div>
  ))}
</div>
  </motion.div>
)}

{/* WEB PROJECTS */}
{activeTab === "web" && (
  <motion.div
    key="web"
    className="flex flex-col gap-10"
    initial={{
      opacity: 0,
      x: 30,
    }}
    animate={{
      opacity: 1,
      x: 0,
    }}
    exit={{
      opacity: 0,
      x: -30,
    }}
    transition={{
      duration: 0.35,
    }}
  >
    {webRows.map((row, rowIndex) => (
      <motion.div
        key={`web-row-${rowIndex}`}
       className="
  grid
  grid-cols-1
  md:grid-cols-2
  gap-10
"
        initial={{
          opacity: 0,
          y: 50,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          amount: 0.15,
          once: false,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
      >
        {row.map((proj, idx) =>
          renderCard(
            proj,
            `web-${rowIndex}-${idx}`
          )
        )}
      </motion.div>
    ))}
  </motion.div>
)}

</AnimatePresence>
        
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
