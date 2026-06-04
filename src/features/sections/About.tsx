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
import { motion, useInView, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

import { useRef } from "react";



// Type for tabs
type TabType = "profile" | "education";

function CounterCard({
  value,
  label,
  prefix = "",
  suffix = "",
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    amount: 0.5,
  });

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 text-center shadow-lg rounded-lg  cursor-pointer hover:shadow-[0_0_25px_#3b82f6] dark:hover:shadow-[0_0_25px_#3b82f6]"
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.95,
      }}
       animate={
    isInView
      ? {
          opacity: 1,
          y: 0,
          scale: 1,
        }
      : {
          opacity: 0,
          y: 50,
          scale: 0.95,
        }
  }
      viewport={{
        amount: 0.5,
      }}
      transition={{
        duration: 0.6,
      }}
    >
      <h3 className="text-3xl font-bold">
        {prefix}
{isInView ? (
  <CountUp
    key={Date.now()}
    start={0}
    end={value}
    duration={2}
    decimals={value % 1 ? 2 : 0}
  />
) : (
  0
)}

        {suffix}
      </h3>

      <p className="mt-2 text-sm">{label}</p>
    </motion.div>
  );
}
function QuickInfoCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        amount: 0.1,
      }}
      transition={{
        duration: 0.5,
      }}
      whileHover={{
        scale: 1.05,
      }}
      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-700 rounded-lg  cursor-pointer hover:shadow-[0_0_25px_#3b82f6] dark:hover:shadow-[0_0_25px_#3b82f6]"
    >
      {icon}

      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {title}
        </p>

        <p className="font-semibold text-slate-900 dark:text-white">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
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
       <motion.div
  className="text-center mb-12"
  initial={{ opacity: 0, y: -40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{amount: 0.3}}
  transition={{ duration: 0.8 }}
>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full"></div>
       </motion.div>

        {/* MOBILE TAB MENU */}
        <div className="flex justify-center mb-4 lg:hidden border-b border-gray-200 dark:border-gray-700">
  {[
    { key: "profile", label: "Profile", icon: <User size={18} /> },
    { key: "education", label: "Education", icon: <GraduationCap size={18} /> },
  ].map((tab) => (
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
          layoutId="mobileTabIndicator"
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

        {/* DESKTOP TAB MENU */}
        <div className="hidden lg:flex justify-center mb-6">
        <div className="relative bg-white dark:bg-gray-800 shadow-md rounded-full p-2 flex gap-2">
            {[
              { key: "profile", label: "Profile", icon: <User size={20} /> },
              { key: "education", label: "Education", icon: <GraduationCap size={20} /> },
            ].map((tab) => (
             <div className="relative">
  {activeTab === tab.key && (
    <motion.div
      layoutId="activeTab"
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
                className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold transition-all duration-300
                  ${
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
        

        {/* CONTENT BOX */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-12">
          <AnimatePresence mode="wait">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
  <motion.div
    key="profile"
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
    <motion.div
  className="flex items-start gap-4 mb-6"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ amount: 0.2 }}
  transition={{ duration: 0.6 }}
>
                <User className="text-blue-600" size={30} />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Introduction
                  </h3>
                  <div className="text-gray-700 dark:text-gray-300 md:text-justify leading-relaxed space-y-4">
  <p>
    I’m <b>Gaurav Kumar</b>, a <b>B.Tech 2026 graduate</b> in
    <i> Electronics and Communication Engineering</i> from
    <u> Guru Ghasidas Vishwavidyalaya (GGV), Bilaspur</u>, with a strong interest in
    <b> Frontend VLSI Design</b>, <b>Digital Electronics</b>, and
    <b> Embedded Systems</b>. I enjoy working on hardware-focused problem-solving and continuously expanding my knowledge in
    <b> Verilog HDL</b>, <b>RTL Design</b>, <b>CMOS Design</b>, and
    <b> Functional Verification</b>.
  </p>

  <p>
    I have hands-on experience with tools and technologies such as
    <b> Xilinx Vivado</b>, <b>Cadence Virtuoso</b>, <b>LTspice</b>,
    <b> MATLAB</b>, and <b>Proteus</b>, along with programming skills in
    <b> Python</b>, <b>JavaScript</b>, <b>HTML</b>, and <b>CSS</b>.
    My projects include <i>SRAM & DRAM Design and Analysis</i>, a
    <i> Moore FSM-based Traffic Light Controller</i>, and implementation of multiple combinational and sequential digital circuits using Verilog HDL.
  </p>

  <p>
    Alongside technical development, I have actively contributed to leadership and mentoring initiatives. I mentored
    <b> 50+ students</b> through <b>EDUGLE</b>, served as
    <b> Content Manager Lead</b> at <b>Equilibrio Techfest</b>, and coordinated student activities and newsletter workflows at
    <i> The Flip Flops</i>. These experiences strengthened my communication, leadership, and teamwork skills.
  </p>

  <p>
 <motion.span
  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-blue-700 bg-blue-100 border border-blue-300 shadow-md"
  animate={{
    scale: [1, 1.05, 1],
  }}
  transition={{
    repeat: Infinity,
    duration: 2.5,
  }}
>
  🎓 GATE ECE 2026 Qualified
</motion.span>

    <br />
    <br />

    I also received a <b>₹50,000 internship stipend</b> at
    <b> Fact App</b> for my technical contributions and performance.
  </p>

  <p>
    Passionate about innovation and continuous learning, I am currently seeking opportunities in
    <b> VLSI</b>, <b>Embedded Systems</b>, and <b>IoT</b> domains where I can apply my technical skills, contribute to impactful projects, and grow as an engineer.
  </p>
</div>
                 






                </div>
              </motion.div>
              <motion.div
  className="grid grid-cols-2 md:grid-cols-4 gap-6 my-10"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{}}
>
  <CounterCard
    value={50}
    suffix="+"
    label="Students Mentored"
  />

  <CounterCard
    value={50000}
    prefix="₹"
    label="Internship Stipend"
  />

  <CounterCard
    value={8.85}
    label="CGPA"
  />

  <CounterCard
    value={10}
    suffix="+"
    label="Projects"
  />
</motion.div>

              {/* Quick Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {[
                  {
                    icon: <MapPin className="text-blue-600" size={24} />,
                    title: "Location",
                    desc: "Hajipur, Bihar, India",
                  },
                  {
                    icon: <Award className="text-blue-600" size={24} />,
                    title: "Achievement",
                    desc: "GATE ECE 2026 Qualified",
                  },
                  {
                    icon: <Goal className="text-blue-600" size={24} />,
                    title: "Skills",
                    desc: "Verilog (Learning), Python, C, MATLAB, ReactJS, HTML, CSS",
                  },
                  {
                    icon: <Calendar className="text-blue-600" size={24} />,
                    title: "Current Focus",
                    desc: "Frontend VLSI, CMOS Design & Embedded Systems",
                  },
                ].map((info, idx) => (
  <QuickInfoCard
    key={idx}
    icon={info.icon}
    title={info.title}
    desc={info.desc}
  />
))
                }
              </div>
            </motion.div>
          )}

          {/* EDUCATION TAB */}
        {activeTab === "education" && (
  <motion.div
    key="education"
   className="animate-fade-in space-y-4"
   initial={{
  opacity: 0,
  y: 30,
}}

whileInView={{
  opacity: 1,
  y: 0,
}}

viewport={{
  amount: 0.2,
  once: true,
}}

transition={{
  duration: 0.6,
  
}}
  >
              {[
                {
                  title: "Guru Ghasidas Vishwavidyalaya, Bilaspur",
                  degree:
                    "Bachelor of Technology — B.Tech, Electronics and Communication Engineering",
                  period: "Nov 2022 – May 2026",
                  grade: "8.91 CGPA ",
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
                      link: "pdf/7th Sem marksheet.pdf",
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
        <motion.div
  key={idx}
  whileHover={{
  scale: 1.05,
  y: -8,
}}
  initial={{
    opacity: 0,
    y: 40,
  }}
  whileInView={{
    opacity: 1,
    y: 0,
  }}
  viewport={{}}
  transition={{
  duration: 0.5,
  delay: idx * 0.1,
}}
  className={`border-l-4 ${edu.borderColor} pl-5 py-3 rounded-r-lg   hover:shadow-[0_0_25px_#3b82f6] dark:hover:shadow-[0_0_25px_#3b82f6] cursor-pointer bg-white dark:bg-gray-800`}


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
       <motion.button
          key={i}
          onClick={() => openCertificate(cert.link)}
          whileHover={{
  y: -3,
  scale: 1.05,
}}

whileTap={{
  scale: 0.95,
}}
         className="px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full font-medium cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"

        >
          {cert.label}
       </motion.button>
      ))}
    </div>
  )}
</motion.div>

              ))}
            </motion.div>
          )}
        
       </AnimatePresence>
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