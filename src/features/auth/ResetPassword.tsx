import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const navigate = useNavigate();

  /* ===============================
     HANDLE SUPABASE RESET LINK
     =============================== */
useEffect(() => {
  const handleRecovery = async () => {
    // 1️⃣ Check for Supabase error in URL
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "")
    );

    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error) {
      setError(
        decodeURIComponent(
          errorDescription || "Reset link is invalid or expired."
        )
      );
      return;
    }

    // 2️⃣ FORCE Supabase to read recovery token
    const { data, error: sessionError } =
      await supabase.auth.getSession();

   if (!data?.session) {
  setError("Reset link expired or already used.");
  return;
}


    // 3️⃣ Recovery session is valid
    setReady(true);

    // 4️⃣ Clean URL (remove hash)
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  };

  handleRecovery();
}, []);


  /* ===============================
     UPDATE PASSWORD
     =============================== */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/auth?mode=login", { replace: true });
    }
  };

  /* ===============================
     UI
     =============================== */
  return (
    <div className="min-h-screen flex items-center justify-center px-4
                    bg-gradient-to-br from-slate-100 to-slate-200
                    dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md
                   bg-white dark:bg-slate-900
                   rounded-2xl shadow-xl
                   border border-slate-200 dark:border-white/10
                   p-8"
      >
        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full
                          bg-blue-600/10 dark:bg-blue-500/15
                          flex items-center justify-center mb-3">
            <Lock className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Choose a new secure password
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-lg
                          bg-red-500/10 dark:bg-red-500/15
                          border border-red-500/20
                          px-4 py-2 text-sm
                          text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {!ready ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Verifying reset link…
          </p>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {/* PASSWORD */}
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-white dark:bg-slate-800
                           border border-slate-300 dark:border-white/10
                           text-slate-900 dark:text-white
                           placeholder-slate-400 dark:placeholder-slate-500
                           focus:ring-2 focus:ring-blue-500
                           pr-12"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-500 hover:text-blue-500
                           dark:text-slate-400 dark:hover:text-blue-400"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CONFIRM */}
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg
                         bg-white dark:bg-slate-800
                         border border-slate-300 dark:border-white/10
                         text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:ring-2 focus:ring-blue-500"
            />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold
                         bg-blue-600 hover:bg-blue-700
                         text-white transition
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating password…" : "Update Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
