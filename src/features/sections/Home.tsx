// Hero.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NextPageArrow } from "../../shared/components/NextPageArrow";

export function Hero() {
  const navigate = useNavigate();

  const texts = [
    "Frontend Web Developer",
    "Aspiring VLSI Frontend Engineer",
    "Aspiring RTL Design Engineer",
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = texts[currentTextIndex];
    let timer: number;

    if (!isDeleting) {
      if (charIndex < current.length) {
        timer = window.setTimeout(() => {
          setCharIndex((p) => p + 1);
          setDisplayText(current.substring(0, charIndex + 1));
        }, 120);
      } else {
        timer = window.setTimeout(() => setIsDeleting(true), 900);
      }
    } else {
      if (charIndex > 0) {
        timer = window.setTimeout(() => {
          setCharIndex((p) => p - 1);
          setDisplayText(current.substring(0, charIndex - 1));
        }, 60);
      } else {
        timer = window.setTimeout(() => {
          setIsDeleting(false);
          setCurrentTextIndex((i) => (i + 1) % texts.length);
        }, 300);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentTextIndex]);

  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResumeOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden
                 bg-gradient-to-br from-blue-50 via-blue-100 to-teal-50
                 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-3">
          Hello <span className="text-blue-400">I'm Gaurav Kumar</span>
        </h1>

        <h2 className="text-lg md:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-white mb-4">
          I am <br />
          <span className="text-blue-500">
            {displayText}
            <span className="border-r-2 border-blue-500 animate-pulse ml-1" />
          </span>
        </h2>

        <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full w-44 mx-auto mb-6" />

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setResumeOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700
                       text-white rounded-lg font-semibold shadow-lg
                       hover:-translate-y-1 transition"
          >
            View Resume
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="px-6 py-3 bg-white dark:bg-slate-700
                       text-blue-600 dark:text-blue-400
                       border-2 border-blue-400 rounded-lg font-semibold
                       hover:bg-blue-600 hover:text-white transition"
          >
            Contact Me
          </button>
        </div>
      </div>

      {/* ✅ AUTO-DETECTED NEXT PAGE ARROW */}
      <NextPageArrow />

      {/* Resume Modal */}
      {resumeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full relative overflow-hidden">
            <button
              onClick={() => setResumeOpen(false)}
              className="absolute top-2 right-3 text-2xl text-red-600"
            >
              ✕
            </button>
            <iframe
              src="pdf/Gaurav Kumar_Resume.pdf"
              className="w-full h-[80vh]"
              title="Resume"
            />
          </div>
        </div>
      )}
    </section>
  );
}
