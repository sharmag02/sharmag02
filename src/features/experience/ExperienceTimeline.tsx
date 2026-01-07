// src/features/experience/ExperienceTimeline.tsx

import { Briefcase, Star, Zap, PenTool } from "lucide-react";
import { Experience } from "../experience/ExperienceAdminHelpers";

interface Props {
  company: string;
  roles: Experience[];
  uniqueId?: string;
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
    <div
      data-card-id={uniqueId}
      className="
        relative p-1 rounded-2xl
        transition-all duration-500 ease-out
        opacity-0 translate-y-6 scale-95
        hover:scale-[1.03]
        hover:shadow-[0_0_30px_#3b82f6]
        bg-white dark:bg-gray-800
      "
    >
      <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-md">
        {/* ================= COMPANY HEADER ================= */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="text-blue-600" size={22} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {company}
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {start} – {end}
          </span>
        </div>

        {/* ================= TIMELINE ================= */}
        <div className="relative">
          {/* SINGLE VERTICAL LINE */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-blue-500/40" />

          <div className="space-y-10">
            {sorted.map((role, index) => (
              <div key={index} className="relative flex">
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

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {role.start_date} – {role.end_date}
                  </p>

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
                          <span
                            key={i}
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
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* ================= END TIMELINE ================= */}
      </div>
    </div>
  );
}
