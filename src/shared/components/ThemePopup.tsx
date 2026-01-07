import { useEffect, useState } from "react";
import { Sun, Moon, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemePopup() {
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // Show popup after random delay (5–10 seconds)
    const delay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

    const timer = setTimeout(() => setShow(true), delay);

    // Auto-close in 5 seconds
    const autoCloseTimer = setTimeout(() => setShow(false), delay + 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="
        fixed bottom-6 right-6 z-50
        bg-white dark:bg-slate-900 
        shadow-2xl border border-gray-300 dark:border-slate-700
        rounded-2xl p-4 w-80
        animate-fade-in
      "
    >
      {/* CLOSE BUTTON */}
      <button
        className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
        onClick={() => setShow(false)}
      >
        <X size={18} />
      </button>

      {/* MESSAGE */}
      <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 pr-6">
        {isMobile
          ? "You can change the theme using the button in the mobile navbar!"
          : "You can change the theme using the toggle in the left sidebar!"}
      </p>

      {/* THEME TOGGLE INSIDE POPUP */}
      <button
        onClick={toggleTheme}
        className="
          w-full py-2 rounded-xl flex items-center justify-center gap-2
          bg-blue-600 text-white 
          dark:bg-slate-200 dark:text-slate-900
          hover:scale-105 transition-all
        "
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        Switch Theme
      </button>
    </div>
  );
}
