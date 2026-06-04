// src/features/experience/ExperienceTimeline.tsx

import { Briefcase, Star, Zap, PenTool } from "lucide-react";
import { Experience } from "../experience/ExperienceAdminHelpers";
import { motion, useInView, AnimatePresence } from "framer-motion";

interface Props {
  company: string;
  roles: Experience[];
  uniqueId?: string;
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
export default function ExperienceTimeline({
  company,
  roles,
  uniqueId,
}: Props) {
  if (!roles || roles.length < 2) return null;

  // Sort newest role first
  const sorted = [...roles].sort(
    (a, b) => b.start_date.localeCompare(a.start_date)
  );

  const start = sorted[sorted.length - 1]?.start_date;
  const end = sorted[0]?.end_date;

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
   whileHover={{
    scale: 1.02,
    y: -8,
  }}
  viewport={{
    amount: 0.15,
    once: false,
  }}
  transition={{
    duration: 0.5,
    ease: "easeOut",
  }}
  className="group relative p-1 rounded-2xl"
>
    <div
  className="
    rounded-2xl
    p-6
    bg-white
    dark:bg-gray-800
    shadow-md
    transition-all
    duration-300
    group-hover:shadow-[0_0_30px_#3b82f6]
  "
>
        {/* ================= COMPANY HEADER ================= */}
        <div className="flex justify-between items-center mb-8">
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
    dark:text-blue-400
    border border-blue-500/20
    whitespace-nowrap
  "
>
  {formatMonthYear(start)} – {formatMonthYear(end)}
</span>
        </div>

        {/* ================= TIMELINE ================= */}
        <div className="relative">
          {/* SINGLE VERTICAL LINE */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-blue-500/40" />

          <div className="space-y-10">
            {sorted.map((role, index) => (
              <motion.div
  key={index}
  className="relative flex"
  initial={{
    opacity: 0,
    y: 20,
  }}
  whileInView={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: index * 0.15,
    duration: 0.4,
  }}
>
                {/* ===== TIMELINE COLUMN ===== */}
                <div className="relative w-10 flex justify-center">
                  {/* ICON LOCKED TO LINE */}
                  <div
                    className="
                      absolute top-1 left-1/2 -translate-x-1/2
                      w-7 h-7 rounded-full bg-blue-600
                      flex items-center justify-center
                      shadow-md
                    "
                  >
                    {index === 0 ? (
                      <Star size={14} className="text-white" />
                    ) : index % 2 === 0 ? (
                      <Zap size={14} className="text-white" />
                    ) : (
                      <PenTool size={14} className="text-white" />
                    )}
                  </div>
                </div>

                {/* ===== CONTENT COLUMN ===== */}
                <div className="flex-1 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {role.title}
                  </h4>

                <div className="mb-3">
  <span
    className="
      inline-block
      px-3 py-1
      rounded-full
      text-xs
      font-semibold
      bg-blue-500/10
      text-blue-500
      dark:text-blue-400
      border border-blue-500/20
    "
  >
    {formatMonthYear(role.start_date)} – {formatMonthYear(role.end_date)}
  </span>
</div>

                  {role.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      {role.description}
                    </p>
                  )}

                  {/* ================= ACHIEVEMENTS ================= */}
                  {role.achievements?.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-blue-600 text-sm font-semibold mb-1">
                        Key Achievements
                      </h5>
                      <ul className="list-disc list-inside space-y-1">
                        {role.achievements.map((a, i) => (
                          <li
                            key={i}
                            className="
                              text-gray-700 dark:text-gray-300
                              transition-colors
                              hover:text-blue-600
                              dark:hover:text-blue-400
                            "
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ================= TECHNOLOGIES ================= */}
                  {role.technologies?.length > 0 && (
                    <div>
                      <h5 className="text-blue-600 text-sm font-semibold mb-1">
                        Technologies
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {role.technologies.map((t, i) => (
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
                              hover:scale-105
                            "
                          >
                            {t}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* ================= END TIMELINE ================= */}
      </div>
    </motion.div>
  );
}
