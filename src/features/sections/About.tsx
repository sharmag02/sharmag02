import {
  Award,
  Calendar,
  MapPin,
  User,
  GraduationCap,
  Goal,
} from "lucide-react";
import { useState } from "react";
import { NextPageArrow } from "../../shared/components/NextPageArrow";


// Type for tabs
type TabType = "profile" | "education";

export function About() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [modalContent, setModalContent] = useState<string | null>(null);

  const openCertificate = (link: string) => setModalContent(link);
  const closeModal = () => setModalContent(null);

  return (
    <section
      id="about"
      className="relative min-h-screen py-6 px-6 bg-slate-50 dark:bg-gray-900"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full"></div>
        </div>

        {/* MOBILE TAB MENU */}
        <div className="flex justify-center mb-4 lg:hidden border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "profile", label: "Profile", icon: <User size={18} /> },
            { key: "education", label: "Education", icon: <GraduationCap size={18} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`relative flex items-center gap-1 px-4 py-2 text-base font-semibold text-gray-600 dark:text-gray-300 transition-all ${
                activeTab === tab.key
                  ? "text-blue-600 dark:text-blue-400 after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:to-pink-500"
                  : "hover:text-blue-500 dark:hover:text-blue-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* DESKTOP TAB MENU */}
        <div className="hidden lg:flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-4">
            {[
              { key: "profile", label: "Profile", icon: <User size={20} /> },
              { key: "education", label: "Education", icon: <GraduationCap size={20} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold transition-all duration-300
                  ${
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

        {/* CONTENT BOX */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-12">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-fade-in">
              <div className="flex items-start gap-4 mb-6">
                <User className="text-blue-600" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Introduction
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 md:text-justify leading-relaxed">
                    I’m Gaurav Kumar, a final-year B.Tech student in Electronics
                    and Communication Engineering at SoSET, GGV Bilaspur. I have
                    a strong interest in <b>Frontend VLSI design,</b> backed by
                    a solid foundation in digital electronics and circuit
                    design. I’m currently learning Verilog to strengthen my
                    hardware-level understanding and design skills. <br />
                    <br />
                    Alongside VLSI, I’m exploring embedded systems, IoT, and
                    real-world technology applications. I have basic experience
                    with MATLAB for hardware interaction and hands-on experience
                    in Python, C, and frontend development using ReactJS, HTML,
                    and CSS. <br />
                    <br />I have also contributed in leadership and
                    collaborative roles— mentoring students through Fact App and
                    EDUGLE, serving as a Placement Cell Coordinator, Content
                    Manager at Solasta (Techfest), and Coordinator of{" "}
                    <b>The Flip Flops,</b> the departmental newsletter. <br />
                    <br />I love combining technical skills with teamwork and
                    innovative problem-solving. I am open to opportunities in
                    VLSI, IoT, and embedded technologies.
                  </p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {[
                  {
                    icon: <MapPin className="text-blue-600" size={24} />,
                    title: "Location",
                    desc: "Bilaspur, Chhattisgarh, India",
                  },
                  {
                    icon: <Award className="text-blue-600" size={24} />,
                    title: "Technical Interests",
                    desc: "VLSI, Embedded Systems, IoT",
                  },
                  {
                    icon: <Goal className="text-blue-600" size={24} />,
                    title: "Skills",
                    desc: "Verilog (Learning), Python, C, MATLAB, ReactJS, HTML, CSS",
                  },
                  {
                    icon: <Calendar className="text-blue-600" size={24} />,
                    title: "Current Focus",
                    desc: "Frontend VLSI & Embedded Systems",
                  },
                ].map((info, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-700 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_25px_#3b82f6] dark:hover:shadow-[0_0_25px_#3b82f6] cursor-pointer"


                  >
                    {info.icon}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{info.title}</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{info.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION TAB */}
        {activeTab === "education" && (
            <div className="animate-fade-in space-y-4">
              {[
                {
                  title: "Guru Ghasidas Vishwavidyalaya, Bilaspur",
                  degree:
                    "Bachelor of Technology — B.Tech, Electronics and Communication Engineering",
                  period: "Nov 2022 – Apr 2026",
                  grade: "8.70 CGPA (6th Sem)",
                  activities: [
                    "Student Coordinator — Departmental Official Newsletter (The Flip Flops)",
                    "University Runner-Up Basketball (Khelo Bharat GGV)",
                    "Content Manager — Equilibrio Techfest 2023",
                  ],
                  borderColor: "border-blue-500",
                  hoverBg: "hover:bg-blue-50",
                  certificates: [
                    {
                      label: "B.Tech Result Certificate",
                      link: "pdf/6th sem marksheet.pdf",
                    },
                    {
                      label: "Basketball Runner-Up Certificate",
                      link: "pdf/Basketball Runner Up.pdf",
                    },
                    {
                      label: "Content Manager Certificate",
                      link: "pdf/Equlibrio .pdf",
                    },
                  ],
                },
                {
                  title: "National Institute of Technology Agartala",
                  degree: "Bachelor of Science — BS, Chemistry",
                  period: "Dec 2021 – Feb 2022",
                  grade: "7.95 CGPA (First Semester)",
                  activities: [
                    "Dropped college after first semester to pursue engineering…",
                  ],
                  borderColor: "border-blue-500",
                  hoverBg: "hover:bg-blue-50",
                  certificates: [],
                },
                {
                  title: "Sri Chaitanya College of Education",
                  degree: "Intermediate (12th), Science (Maths)",
                  period: "Jul 2018 – Feb 2020",
                  grade: "85%",
                  activities: ["Basketball", "Volleyball"],
                  borderColor: "border-blue-500",
                  hoverBg: "hover:bg-blue-50",
                  certificates: [
                    {
                      label: "12th Result Certificate",
                      link: "pdf/Gaurav Kumar Class 12th Marksheet .pdf",
                    },
                  ],
                },
                {
                  title: "B D Public School, Hajipur",
                  degree: "Class 7th to 10th",
                  period: "Mar 2015 – Mar 2018",
                  grade: "Matriculate — 84%",
                  activities: ["Science Competition"],
                  borderColor: "border-blue-500",
                  hoverBg: "hover:bg-blue-50",
                  certificates: [
                    {
                      label: "10th Result Certificate",
                      link: "pdf/Gaurav Kumar Class 10 marksheet .pdf",
                    },
                    {
                      label: "Science Competition Certificate",
                      link: "pdf/Science Competition .pdf",
                    },
                  ],
                },
              ].map((edu, idx) => (
                <div
  key={idx}
  className={`border-l-4 ${edu.borderColor} pl-5 py-3 rounded-r-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_25px_#3b82f6] dark:hover:shadow-[0_0_25px_#3b82f6] cursor-pointer bg-white dark:bg-gray-800`}


>
  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
    {edu.title}
  </h3>
  <p className="text-blue-600 font-semibold">{edu.degree}</p>
  <p className="text-gray-600 dark:text-gray-300 mb-1">{edu.period}</p>
  <p className="text-gray-700 dark:text-gray-300 mb-1">
    Grade: <span className="font-semibold">{edu.grade}</span>
  </p>
  <p className="text-gray-700 dark:text-gray-300">
    Activities & Societies:
    <br />
    {edu.activities.map((act, i) => (
      <span key={i} className="block">
        • {act}
      </span>
    ))}
  </p>

  {/* Certificates */}
  {edu.certificates.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-2">
      {edu.certificates.map((cert, i) => (
        <button
          key={i}
          onClick={() => openCertificate(cert.link)}
         className="px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"

        >
          {cert.label}
        </button>
      ))}
    </div>
  )}
</div>

              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden max-w-3xl w-full shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-red-600 dark:text-red-400 font-bold text-2xl hover:text-red-700 dark:hover:text-red-500"
            >
              ✕
            </button>
            <iframe
              src={modalContent}
              className="w-full h-[70vh]"
              title="Certificate"
            />
          </div>
        </div>
      )}
      {/* ✅ AUTO NEXT PAGE ARROW */}
<NextPageArrow />

    </section>
  );
}
