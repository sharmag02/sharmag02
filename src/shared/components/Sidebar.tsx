import {
  Github,
  Linkedin,
  Mail,
  Twitter,
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
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

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

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-72 z-40 flex flex-col
      ${
        theme === "light"
          ? "bg-gradient-to-b from-slate-100 to-white text-slate-900"
          : "bg-gradient-to-b from-slate-950 to-slate-900 text-white"
      }
      border-r border-white/10 shadow-2xl`}
    >
      {/* ================= PROFILE ================= */}
      <div className="px-6 pt-4 pb-3 border-b border-white/10">
        <div className="flex flex-col items-center text-center">
          {/* Avatar (HARD LIMITED) */}
          <div className="relative">
            <img
              src="/pdf/photo.jpeg"
              alt="Gaurav Kumar"
              className="
                w-24 h-24
                rounded-full
                border-4 border-blue-500
                shadow-md
                object-cover
              "
            />
            {/* <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" /> */}
          </div>

          <h2 className="mt-2 text-lg font-semibold leading-tight">
            Gaurav Kumar
          </h2>

          <p className="text-sm text-blue-400 leading-tight">
            Frontend • VLSI Engineer
          </p>

          {profile?.is_admin && (
            <span className="mt-1 text-xs px-3 py-0.5 rounded-full bg-green-600 text-white">
              Admin
            </span>
          )}
        </div>

        {/* SOCIALS + THEME */}
        <div className="mt-3 flex justify-center gap-2">
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
              className="w-9 h-9 rounded-full
              flex items-center justify-center
              bg-white/5 border border-white/10
              hover:bg-blue-600 hover:text-white transition"
            >
              <Icon size={16} />
            </a>
          ))}

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full
            flex items-center justify-center
            bg-white/10 border border-white/10
            hover:scale-110 transition"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* ================= NAV ================= */}
      <div className="flex-1 px-4 py-3">
        <nav className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = activePath === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`relative w-full flex items-center gap-3
                px-4 py-2.5 rounded-xl transition
                ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-white/5"
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
      </div>

      {/* ================= AUTH ================= */}
     <div className="px-4 py-2 border-t border-white/10">
  {!user ? (
    <div className="flex gap-2">
      {/* LOGIN */}
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
    <div className="space-y-2">
      {/* Non-admin user name */}
      {!profile?.is_admin && (
        <div className="text-center text-xs text-slate-400 truncate">
          {profile?.full_name || user.email}
        </div>
      )}

      <div className="flex gap-2">
        {/* ADMIN */}
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

        {/* LOGOUT */}
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


      {/* ================= FOOTER ================= */}
      <div className="text-center text-xs py-2 text-slate-400">
        ©  Gaurav Kumar
      </div>
    </aside>
  );
}
