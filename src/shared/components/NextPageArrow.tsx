import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_FLOW } from "../config/routeFlow";

export function NextPageArrow() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  // 🔧 Normalize dynamic & nested routes
  const normalizedPath =
    pathname.startsWith("/blog") ? "/blog" :
    pathname.startsWith("/projects") ? "/projects" :
    pathname;

  const currentIndex = ROUTE_FLOW.indexOf(normalizedPath);
  const nextRoute =
    currentIndex !== -1 ? ROUTE_FLOW[currentIndex + 1] : null;

  // 🚫 Hide arrow on last page
  if (!nextRoute) return null;

  const label =
    nextRoute === "/contact"
      ? "Go to Contact"
      : `Go to ${nextRoute
          .replace("/", "")
          .replace("-", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())}`;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 group">
      {/* Tooltip */}
      <div
        className="
          absolute -top-10 left-1/2 -translate-x-1/2
          px-3 py-1 text-xs font-medium rounded-md
          bg-slate-900 text-white
          dark:bg-white dark:text-slate-900
          opacity-0 scale-95
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200
          pointer-events-none whitespace-nowrap
        "
      >
        {label}
      </div>

      {/* Arrow Button */}
      <button
        onClick={() => navigate(nextRoute)}
        className="
          relative p-3 rounded-full
          bg-white/20 dark:bg-black/30
          backdrop-blur
          text-blue-800 dark:text-white
          shadow-lg
          animate-float
          hover:scale-110
          hover:shadow-blue-500/50
          transition duration-300
          cursor-pointer
        "
        aria-label={label}
      >
        <span
          className="
            absolute inset-0 rounded-full
            bg-blue-500/30 blur-lg
            opacity-0 group-hover:opacity-100
            transition
          "
        />
        <ChevronDown className="relative w-7 h-7 md:w-8 md:h-8" />
      </button>
    </div>
  );
}
