import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Login } from "./Login";
import { Signup } from "./Signup";

type AuthMode = "login" | "signup";

export default function AuthTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlMode = searchParams.get("mode") as AuthMode | null;

  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    if (urlMode === "login" || urlMode === "signup") {
      setMode(urlMode);
    }
  }, [urlMode]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setSearchParams({ mode: m });
  };

  return (
    <div className="
      min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br
      from-slate-100 via-slate-200 to-slate-300
      dark:from-[#0b0f19] dark:via-[#0f172a] dark:to-[#020617]
    ">
      {/* AUTH CARD */}
      <div className="
        w-full max-w-md rounded-2xl overflow-hidden
        bg-white dark:bg-[#020617]
        border border-slate-200 dark:border-white/10
        shadow-xl dark:shadow-[0_0_40px_rgba(59,130,246,0.15)]
      ">
        {/* TABS */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900">
          {(["login", "signup"] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => switchMode(tab)}
              className={`py-3 text-sm font-semibold transition
                ${mode === tab
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
            >
              {tab === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex w-[200%]"
            animate={{ x: mode === "login" ? "0%" : "-50%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
          >
            <div className="w-1/2 p-8">
              <Login onToggleMode={() => switchMode("signup")} />
            </div>

            <div className="w-1/2 p-8">
              <Signup onToggleMode={() => switchMode("login")} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
