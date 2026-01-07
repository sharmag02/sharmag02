import { useState, useEffect, useRef } from "react";
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
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ---------------- FETCH ---------------- */
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCategories(data);
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
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const obs = new IntersectionObserver(
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

    observerRef.current = obs;

    const cards = document.querySelectorAll<HTMLElement>(
      `[data-skill-id^="${activeTab}-"]`
    );
    cards.forEach((c) => obs.observe(c));

    return () => obs.disconnect();
  }, [activeTab, categories]);

  const visibleCategories = categories.filter(
    (c) => c.category === activeTab
  );

  /* ---------------- UI ---------------- */
  return (
    <section id="skills" className="relative py-6 px-6 bg-slate-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Expertise
          </h2>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" />
        </div>

        {/* ================= MOBILE TABS (FIXED) ================= */}
        <div className="flex justify-center mb-6 lg:hidden border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "skill", label: "Skills", icon: Laptop },
            { id: "tool", label: "Tools", icon: Hammer },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2 font-semibold transition-all
                ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-pink-500"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= DESKTOP TABS ================= */}
        <div className="hidden lg:flex justify-center mb-10">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-4">
            {[
              { id: "skill", label: "Skills", icon: Laptop },
              { id: "tool", label: "Tools", icon: Hammer },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 flex items-center gap-2 rounded-full font-semibold transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= CARDS ================= */}
        <div className="grid md:grid-cols-2 gap-10">
          {visibleCategories.map((cat, idx) => {
            const Icon =
              (LucideIcons as any)[cat.icon || "Code"] || LucideIcons.Code;

            return (
              <div
                key={cat.id}
                data-skill-id={`${activeTab}-${idx}`}
                className="group relative p-1 rounded-2xl transition-all duration-300
                  opacity-0 translate-y-6 scale-95
                  hover:shadow-[0_0_25px_#3b82f6]
                  dark:hover:shadow-[0_0_25px_#3b82f6]"
              >
                <div
                  className="rounded-2xl p-6 transition-all duration-500 transform
                    group-hover:scale-105 bg-white dark:bg-gray-800"
                  style={{ minHeight: "180px" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon className="text-white" size={26} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-700
                          border border-gray-300 dark:border-gray-600
                          rounded-full text-gray-800 dark:text-gray-200
                          font-medium hover:bg-blue-600 hover:text-white
                          dark:hover:bg-blue-600 dark:hover:text-white
                          transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
