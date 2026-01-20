import {
  Menu as MenuIcon,
  X,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Sun,
  Moon,
  LogIn, UserPlus, LogOut, Shield,
  Home,
  User,
  Briefcase,
  FolderGit2,
  Award,
  BookOpen,
  Phone,
} from "lucide-react";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

/* ROUTE NAV ITEMS (MATCH SIDEBAR) */
const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/about", label: "About Me", icon: User },
  { path: "/experience", label: "Experience", icon: Briefcase },
  { path: "/projects", label: "Projects", icon: FolderGit2 },
  { path: "/skills", label: "Skills", icon: Award },
  { path: "/certifications", label: "Certifications", icon: BookOpen },
  { path: "/blog", label: "Blog", icon: BookOpen },
  { path: "/contact", label: "Contact", icon: Phone },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const haptic = () => {
    if ("vibrate" in navigator) navigator.vibrate(10);
  };

  const goTo = (path: string, state?: any) => {
    haptic();
    setOpen(false);
    navigate(path, state ? { state } : undefined);
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div
        className={`lg:hidden fixed top-0 left-0 right-0 h-16 z-50
        backdrop-blur-md flex items-center justify-between px-6 shadow-lg
        ${
          theme === "light"
            ? "bg-slate-200/90 text-slate-900"
            : "bg-slate-900/90 text-white"
        }`}
      >
        <button
          onClick={() => goTo("/")}
          className="font-bold text-lg bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent"
        >
          Gaurav Kumar
        </button>

        <button onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      {/* ================= SLIDE MENU ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-40 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}
        ${
          theme === "light"
            ? "bg-gradient-to-b from-slate-100 to-white text-slate-900"
            : "bg-gradient-to-b from-slate-950 to-slate-900 text-white"
        }`}
      >
        <div className="pt-24 px-6 pb-6 flex flex-col h-full overflow-y-auto">

          {/* ================= PROFILE ================= */}
          <div className="text-center mb-6">
            <img
              src="/pdf/photo.jpeg"
              className="w-24 h-24 mx-auto rounded-full border-4 border-blue-500"
              alt="Profile"
            />
            <h2 className="mt-2 font-semibold">Gaurav Kumar</h2>
            <p className="text-sm text-blue-400">Frontend • VLSI Engineer</p>

            {user && (
              <p className="text-xs mt-1 text-slate-400">
                {profile?.full_name || user.email}
              </p>
            )}
             {profile?.is_admin && (
            <span className="mt-1 text-xs px-3 py-0.5 rounded-full bg-green-600 text-white">
              Admin
            </span>
          )}
          </div>

          {/* ================= NAV ================= */}
          <nav className="flex-1 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;

              return (
                <button
                  key={path}
                  onClick={() => goTo(path)}
                  className={`relative w-full flex items-center gap-4
                  px-4 py-3 rounded-xl transition
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : theme === "light"
                      ? "hover:bg-slate-200"
                      : "hover:bg-white/10"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-blue-400" />
                  )}
                  <Icon
                    size={18}
                    className={active ? "text-white" : "text-slate-400"}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* ================= AUTH ================= */}
     {/* ================= AUTH ================= */}
<div className="px-4 py-2 border-t border-white/10">
  {!user ? (
    /* ---- NOT LOGGED IN ---- */
    <div className="flex gap-2">

      {/* LOGIN */}
      <button
        onClick={() => navigate("/auth?mode=login")}
        className="flex-1 py-2 text-sm rounded-lg
                   bg-blue-600 text-white
                   flex items-center justify-center gap-2
                   hover:bg-blue-700 transition"
      >
        <LogIn size={16} />
        Login
      </button>

      {/* SIGNUP */}
      <button
        onClick={() => navigate("/auth?mode=signup")}
        className="flex-1 py-2 text-sm rounded-lg
                   bg-purple-600 text-white
                   flex items-center justify-center gap-2
                   hover:bg-purple-700 transition"
      >
        <UserPlus size={16} />
        Signup
      </button>

    </div>
  ) : (
    /* ---- LOGGED IN ---- */
    <div className="space-y-2">

      <div className="flex gap-2">

        {/* ⭐ USER BUTTON (BLUE) */}
        {!profile?.is_admin && (
          <button
            onClick={() => navigate("/community/dashboard")}
            className="flex-1 py-2 text-sm rounded-lg
                       bg-blue-600 text-white
                       flex items-center justify-center gap-2
                       hover:bg-blue-700 transition"
          >
            <User size={16} />
            {profile?.full_name || user.email}
          </button>
        )}

        {/* ⭐ ADMIN BUTTON (GREEN) */}
        {profile?.is_admin && (
          <button
            onClick={() => navigate("/admin")}
            className="flex-1 py-2 text-sm rounded-lg
                       bg-green-600 text-white
                       flex items-center justify-center gap-2
                       hover:bg-green-700 transition"
          >
            <Shield size={16} />
            Admin
          </button>
        )}

        {/* LOGOUT BUTTON (RED) */}
        <button
          onClick={signOut}
          className="flex-1 py-2 text-sm rounded-lg
                     bg-red-600 text-white
                     flex items-center justify-center gap-2
                     hover:bg-red-700 transition"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

    </div>
  )}
</div>



          {/* ================= SOCIAL + THEME (BOTTOM) ================= */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {[
              { icon: Github, link: "https://github.com/sharmag02" },
              { icon: Linkedin, link: "https://linkedin.com/in/sharmag02" },
              { icon: Twitter, link: "https://twitter.com/sharmag02off" },
              { icon: Mail, link: "mailto:contact.sharmag02@gmail.com" },
            ].map(({ icon: Icon, link }, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center
                bg-white/10 border border-white/10 hover:bg-blue-600 transition"
              >
                <Icon size={16} />
              </a>
            ))}

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center
              bg-white/10 border border-white/10 hover:scale-110 transition"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          <p className="text-xs text-center mt-4 text-slate-400">
            © Gaurav Kumar
          </p>
        </div>
      </div>

      {/* ================= BACKDROP ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
