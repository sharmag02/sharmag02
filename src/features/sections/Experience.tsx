import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
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
  

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchAllExperiences().then(setExperiences);
  }, []);


 

    

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
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{amount: 0.3}}
          transition={{ duration: 0.8 }}
        >
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Experience
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
          layoutId="experienceMobileTabIndicator"
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
            layoutId="experienceDesktopTab"
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

          {tab.key === "industry"
            ? "Industry Experience"
            : "Clubs & Extracurriculars"}
        </button>
      </div>
    ))}
  </div>
</div>

        {/* ================= CARDS ================= */}
       <AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    className="flex flex-col gap-8"
    initial={{
      opacity: 0,
      y: 20,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: -20,
    }}
    transition={{
      duration: 0.35,
    }}
  >
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
  </motion.div>
</AnimatePresence>
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
function formatMonthYear(date: string | null) {
  if (!date || date === "Present") return "Present";

  const [year, month] = date.split("-");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${monthNames[Number(month) - 1]} ${year}`;
}

function SingleExperienceCard({ company, role, uniqueId }: SingleProps) {
 
  return (
    <motion.div
    
  data-card-id={uniqueId}
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
  once:false,
}}

transition={{
  duration: 0.7,
  ease: "easeOut",
}}

      className="group relative p-1 rounded-2xl"
    >
      <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 transition-all duration-500 shadow-md group-hover:scale-[1.03] group-hover:shadow-[0_0_30px_#3b82f6]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
          <div className="flex items-center gap-3">
            <Briefcase className="text-blue-600" size={22} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {company}
            </h3>
          </div>
        <span
  className="
    px-3 py-1
    rounded-full
    text-xs
    font-semibold
    bg-blue-500/10
    text-blue-500
    border border-blue-500/20
  "
>
  {formatMonthYear(role.start_date)} – {formatMonthYear(role.end_date)}
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
              <motion.span
  key={i}
  whileHover={{
    scale: 1.08,
    y: -2,
  }}
  whileTap={{
    scale: 0.95,
  }}
                   className="
                              px-3 py-1 rounded-full text-sm font-medium
                              bg-gray-100 dark:bg-gray-700
                              text-gray-800 dark:text-gray-200
                              border border-gray-300 dark:border-gray-600
                              cursor-pointer
                              transition-all duration-300
                              hover:bg-blue-600 dark:hover:bg-blue-600
                              hover:text-white dark:hover:text-white
                              hover:border-blue-600 dark:hover:border-blue-600
                              hover:scale-105"
                  
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
   </motion.div>
  );
}
