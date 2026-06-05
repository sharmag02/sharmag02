import { useEffect, useState } from "react";
import { motion,  AnimatePresence } from "framer-motion";
import { supabase } from "../../shared/lib/supabase";
import * as LucideIcons from "lucide-react";
import { Laptop, Hammer } from "lucide-react";
import { NextPageArrow } from "../../shared/components/NextPageArrow";


type SkillRow = {
  id: number;
  title: string;
  items: string[];
  category: "skill" | "tool";
  icon?: string;
};

export default function Skills() {
  const [activeTab, setActiveTab] = useState<"skill" | "tool">("skill");
  const [categories, setCategories] = useState<SkillRow[]>([]);
const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */
  const fetchCategories = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    setCategories(data);
  }

  setLoading(false);
};
  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel("skills-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "skills" },
        fetchCategories
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------------- OBSERVER ---------------- */

     const visibleCategories = categories.filter( (c) => c.category === activeTab );

  
if (loading) {
  return (
    <section
      id="skills"
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
      <div className="max-w-6xl mx-auto">
        {/* Header Space */}
        <div className="h-[120px]" />

        {/* Skills Cards Placeholder */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="h-[220px]" />
          <div className="h-[220px]" />
          <div className="h-[220px]" />
          <div className="h-[220px]" />
        </div>
      </div>
    </section>
  );
}
  /* ---------------- UI ---------------- */
  return (
    <section id="skills" className="relative
    min-h-screen
    overflow-hidden
    py-6
    px-6
    bg-slate-50
    dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
              <motion.div
  className="text-center mb-12"
  initial={{ opacity: 0, y: -40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{amount: 0.3}}
  transition={{ duration: 0.8 }}
>
        {/* HEADER */}
        
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Expertise
          </h2>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" />
        
        </motion.div>

        {/* ================= MOBILE TABS (FIXED) ================= */}
       <div className="flex justify-center mb-6 lg:hidden border-b border-gray-200 dark:border-gray-700">
  {[
    { id: "skill", label: "Skills", icon: Laptop },
    { id: "tool", label: "Tools", icon: Hammer },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id as any)}
      className={`relative flex items-center gap-2 px-4 py-2 text-base font-semibold transition-colors duration-300 ${
        activeTab === tab.id
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
      }`}
    >
      {activeTab === tab.id && (
        <motion.div
          layoutId="skillsMobileTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-pink-500"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        <tab.icon size={18} />
        {tab.label}
      </span>
    </button>
  ))}
</div>

        {/* ================= DESKTOP TABS ================= */}
        <div className="hidden lg:flex justify-center mb-10">
  <div className="relative bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-2">
    {[
      { id: "skill", label: "Skills", icon: Laptop },
      { id: "tool", label: "Tools", icon: Hammer },
    ].map((tab) => (
      <div key={tab.id} className="relative">
        {activeTab === tab.id && (
          <motion.div
            layoutId="skillsDesktopTab"
            className="absolute inset-0 bg-blue-600 rounded-full"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
          />
        )}

        <button
          onClick={() => setActiveTab(tab.id as any)}
          className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold transition-all duration-300 ${
            activeTab === tab.id
              ? "text-white"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <tab.icon size={20} />
          {tab.label}
        </button>
      </div>
    ))}
  </div>
</div>

        {/* ================= CARDS ================= */}
        <AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    className="grid md:grid-cols-2 gap-10"
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
  x:-30,
}}
    transition={{
      duration: 0.35,
    }}
  >
          {visibleCategories.map((cat, idx) => {
            const Icon =
              (LucideIcons as any)[cat.icon || "Code"] || LucideIcons.Code;

            return (
              <motion.div
  key={cat.id}
  data-skill-id={`${activeTab}-${idx}`}
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
    delay: idx * 0.1,
    ease: "easeOut",
  }}
  whileHover={{
    y: -4,
  }}
                className="group 
                  "
              >
                <div
  className="
    rounded-2xl
    p-6
    bg-white
    dark:bg-gray-800
    shadow-md
    transition-all
    duration-500
    group-hover:scale-[1.03]
    group-hover:shadow-[0_0_30px_#3b82f6]
  "
  style={{ minHeight: "180px" }}
>
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
  whileHover={{
    rotate: 5,
    scale: 1.1,
  }}
  className="p-3 bg-blue-600 rounded-lg"
>
                      <Icon className="text-white" size={26} />
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((skill, sIdx) => (
                      <motion.span
                        key={sIdx}
                          whileHover={{
    scale: 1.08,
    y: -2,
  }}
  whileTap={{
    scale: 0.95,
  }}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-700
                          border border-gray-300 dark:border-gray-600
                          rounded-full text-gray-800 dark:text-gray-200
                          font-medium hover:bg-blue-600 hover:text-white
                          dark:hover:bg-blue-600 dark:hover:text-white
                          transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        </AnimatePresence>
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
