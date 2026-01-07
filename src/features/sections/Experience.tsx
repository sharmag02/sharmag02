import { useEffect, useRef, useState } from "react";
import { Briefcase, Star } from "lucide-react";
import {
  fetchAllExperiences,
  Experience,
} from "../experience/ExperienceAdminHelpers";
import ExperienceTimeline from "../experience/ExperienceTimeline";
import { NextPageArrow } from "../../shared/components/NextPageArrow";


type TabType = "industry" | "club";

/* ---------- TAB CONFIG ---------- */
const tabs = [
  {
    key: "industry",
    label: "Industry",
    icon: <Briefcase size={18} />,
  },
  {
    key: "club",
    label: "Clubs",
    icon: <Star size={18} />,
  },
];

export default function ExperienceSection() {
  const [activeTab, setActiveTab] = useState<TabType>("industry");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchAllExperiences().then(setExperiences);
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

    const selector = `[data-card-id^="${activeTab}-"]`;
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, [activeTab, experiences]);

  /* ---------------- GROUP BY COMPANY ---------------- */
  const groupByCompany = (items: Experience[]) => {
    const grouped: Record<string, Experience[]> = {};
    items.forEach((item) => {
      if (!grouped[item.company]) grouped[item.company] = [];
      grouped[item.company].push(item);
    });
    return grouped;
  };

  const industryExperience = experiences.filter(
    (e) => e.type === "industry"
  );
  const clubsExperience = experiences.filter((e) => e.type === "club");

  const groupedIndustry = groupByCompany(industryExperience);
  const groupedClubs = groupByCompany(clubsExperience);

  return (
    <section
      id="experience"
      className="relative min-h-screen py-6 px-6 bg-slate-50 dark:bg-gray-900"
    >
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Experience
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full" />
        </div>

        {/* ================= MOBILE TABS ================= */}
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

        {/* ================= DESKTOP TABS ================= */}
        <div className="hidden lg:flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-6 py-2 rounded-full font-semibold transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
                }`}
              >
                {tab.icon}
                {tab.key === "industry"
                  ? "Industry Experience"
                  : "Clubs & Extracurriculars"}
              </button>
            ))}
          </div>
        </div>

        {/* ================= CARDS ================= */}
        <div className="flex flex-col gap-8">
          {/* INDUSTRY */}
          {activeTab === "industry" &&
            Object.entries(groupedIndustry).map(([company, roles], i) =>
              roles.length > 1 ? (
                <ExperienceTimeline
                  key={`industry-${i}`}
                  company={company}
                  roles={roles}
                  uniqueId={`industry-${i}`}
                />
              ) : (
                <SingleExperienceCard
                  key={`industry-${i}`}
                  company={company}
                  role={roles[0]}
                  uniqueId={`industry-${i}`}
                />
              )
            )}

          {/* CLUB */}
          {activeTab === "club" &&
            Object.entries(groupedClubs).map(([company, roles], i) =>
              roles.length > 1 ? (
                <ExperienceTimeline
                  key={`club-${i}`}
                  company={company}
                  roles={roles}
                  uniqueId={`club-${i}`}
                />
              ) : (
                <SingleExperienceCard
                  key={`club-${i}`}
                  company={company}
                  role={roles[0]}
                  uniqueId={`club-${i}`}
                />
              )
            )}
        </div>
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}

/* ================= SINGLE CARD ================= */

interface SingleProps {
  company: string;
  role: Experience;
  uniqueId: string;
}

function SingleExperienceCard({ company, role, uniqueId }: SingleProps) {
  return (
    <div
      data-card-id={uniqueId}
      className="group relative p-1 rounded-2xl transition-all duration-500 ease-out opacity-0 translate-y-6 scale-95"
    >
      <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 transition-all duration-500 shadow-md group-hover:scale-[1.03] group-hover:shadow-[0_0_30px_#3b82f6]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Briefcase className="text-blue-600" size={22} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {company}
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {role.start_date} – {role.end_date}
          </span>
        </div>

        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          {role.title}
        </h4>

        {role.description && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 leading-relaxed">
            {role.description}
          </p>
        )}

        {role.achievements?.length > 0 && (
          <div className="mb-2">
            <h5 className="text-sm font-semibold text-blue-600 mb-1">
              Key Achievements
            </h5>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              {role.achievements.map((ach, i) => (
                <li key={i} className="hover:text-blue-500 transition-colors">
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        )}

        {role.technologies?.length > 0 && (
          <div className="mt-2">
            <h5 className="text-sm font-semibold text-blue-600 mb-1">
              Technologies
            </h5>
            <div className="flex flex-wrap gap-2">
              {role.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
