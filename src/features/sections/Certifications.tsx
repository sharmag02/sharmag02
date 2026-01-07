import { useEffect, useState, useRef } from "react";
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
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  /* ---------------- INTERSECTION OBSERVER ---------------- */
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
    document
      .querySelectorAll<HTMLElement>("[data-cert-id]")
      .forEach((c) => observer.observe(c));

    return () => observer.disconnect();
  }, [activeTab, certifications]);

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
      <p className="text-center py-10 text-gray-600 dark:text-gray-300">
        Loading certifications...
      </p>
    );
  }

  return (
    <section
      id="certifications"
      className="relative py-6 px-4 md:px-6 bg-slate-50 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Certifications
          </h2>
          <div className="w-24 h-[3px] bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full" />
        </div>

        {/* ================= MOBILE TABS ================= */}
        <div className="flex justify-center mb-6 lg:hidden border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`relative flex items-center gap-2 px-4 py-2 font-semibold transition-all
                  ${
                    activeTab === tab.key
                      ? "text-blue-600 dark:text-blue-400 after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-pink-500"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= DESKTOP TABS ================= */}
        <div className="hidden lg:flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all
                    ${
                      activeTab === tab.key
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((cert, index) => (
            <div
              key={cert.id}
              data-cert-id
              className="group relative p-1 rounded-2xl transition-all duration-300
                opacity-0 translate-y-6 scale-95
                bg-blue-50 dark:bg-gray-800
                hover:shadow-[0_0_25px_#3b82f6]
                hover:-translate-y-2"
            >
              <div className="rounded-2xl p-4 transition-all duration-500 group-hover:scale-105">
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
            </div>
          ))}
        </div>
      </div>
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
