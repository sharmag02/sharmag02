import { useEffect,useRef, useState } from "react";
import { motion,  AnimatePresence } from "framer-motion";
import { Award, Wrench, ExternalLink } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { NextPageArrow } from "../../shared/components/NextPageArrow";


type Certification = {
  id: number;
  title: string;
  issuer: string;
  issued_date: string | null;
  image?: string;
  link?: string;
  type: string;
};

type TabType = "combined" | "activities";

export function Certifications() {
  const [activeTab, setActiveTab] = useState<TabType>("combined");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
 

  const tabs = [
    {
      key: "combined",
      label: "Course & Internship",
      icon: Award,
    },
    {
      key: "activities",
      label: "Workshops & Extracurricular",
      icon: Wrench,
    },
  ];

  /* ---------------- FETCH ---------------- */
  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("issued_date", { ascending: false });

      if (error) throw error;
      setCertifications(data ?? []);
    } catch (error) {
      console.error("Error fetching certifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

 

  /* ---------------- FILTER ---------------- */
  const data =
    activeTab === "combined"
      ? certifications.filter(
          (c) => c.type === "Course Completion" || c.type === "Internship"
        )
      : certifications.filter(
          (c) => c.type === "Workshop" || c.type === "Extracurricular"
        );

  /* ---------------- DATE FORMAT ---------------- */
  const formatDate = (date: string | null) => {
    if (!date) return "Date not available";
    const parsed = new Date(`${date}T00:00:00`);
    if (isNaN(parsed.getTime())) return "Date not available";

    return parsed.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
    });
  };

 if (loading) {
  return (
    <section
      id="certifications"
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
      <div className="max-w-7xl mx-auto">
        {/* Header Space */}
        <div className="h-[120px]" />

        {/* Tabs Space */}
        <div className="h-[60px]" />

        {/* Certificate Cards Placeholder */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="h-[420px]" />
          <div className="h-[420px]" />
          <div className="h-[420px]" />
          <div className="h-[420px]" />
          <div className="h-[420px]" />
          <div className="h-[420px]" />
        </div>
      </div>
    </section>
  );
}

  return (
    <section
      id="certifications"
      className="relative
    min-h-screen
    overflow-hidden
    py-6
    px-6
    bg-slate-50
    dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">
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
            Certifications
          </h2>
          <div className="w-24 h-[3px] bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full" />
        </div>
        </motion.div>


        {/* ================= MOBILE TABS ================= */}
<div className="flex justify-center mb-4 lg:hidden border-b border-gray-200 dark:border-gray-700">
  {tabs.map((tab) => {
    const Icon = tab.icon;

    return (
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
            layoutId="certificationMobileTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-pink-500"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
          />
        )}

        <span className="relative z-10 flex items-center gap-1">
          <Icon size={18} />
          {tab.label}
        </span>
      </button>
    );
  })}
</div>

       {/* ================= DESKTOP TABS ================= */}
<div className="hidden lg:flex justify-center mb-6">
  <div className="relative bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-2">
    {tabs.map((tab) => {
      const Icon = tab.icon;

      return (
        <div key={tab.key} className="relative">
          {activeTab === tab.key && (
            <motion.div
              layoutId="certificationDesktopTab"
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
            <Icon size={18} />
            {tab.label}
          </button>
        </div>
      );
    })}
  </div>
</div>

        {/* ================= GRID ================= */}
       <AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
          {data.map((cert, index) => (
           <motion.div
  key={cert.id}
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
    delay: index * 0.08,
    ease: "easeOut",
  }}
  whileHover={{
    y: -4,
  }}
  className="group relative p-1 rounded-2xl"
>
              <div
  className="
    rounded-2xl
    p-5
    bg-white
    dark:bg-gray-800
    transition-all
    duration-500
    group-hover:scale-[1.05]
    group-hover:shadow-[0_0_25px_#3b82f6]
  "
>
                <div className="relative overflow-hidden h-48 rounded-xl mb-4 shadow-md">
                  {cert.image && (
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-6">
                    <Award className="text-blue-400" size={32} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {cert.title}
                </h3>
                <p className="text-blue-600 font-semibold mb-1">
                  {cert.issuer}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                  {cert.type}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {formatDate(cert.issued_date)}
                </p>

                {cert.link && (
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm
                      bg-white dark:bg-gray-700
                      text-gray-800 dark:text-gray-200
                      border border-gray-300 dark:border-gray-600
                      rounded-full transition-all duration-300
                      hover:bg-blue-600 hover:text-white
                      dark:hover:bg-blue-600 dark:hover:text-white"
                  >
                    View Credential <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
        </AnimatePresence>
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
