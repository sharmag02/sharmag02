import { useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br
        from-slate-100 via-slate-200 to-slate-300
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          w-full max-w-md
          rounded-2xl
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-white/10
          shadow-xl dark:shadow-2xl
          p-8
        "
      >
        {!sent ? (
          <>
            {/* HEADER */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div
                className="
                  w-14 h-14 rounded-full
                  bg-blue-600/10 dark:bg-blue-500/15
                  flex items-center justify-center mb-4
                "
              >
                <Mail className="text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Forgot password?
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Enter your registered email and we’ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="
                    text-sm rounded-lg px-4 py-3
                    bg-red-50 text-red-600
                    dark:bg-red-500/10 dark:text-red-400
                  "
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full px-4 py-3 rounded-lg
                    bg-white dark:bg-slate-800
                    border border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 rounded-lg font-semibold
                  bg-blue-600 hover:bg-blue-700
                  dark:bg-blue-600 dark:hover:bg-blue-500
                  text-white
                  transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {loading ? "Sending reset link…" : "Send reset link"}
              </button>
            </form>

            <button
              onClick={() => navigate("/auth?mode=login")}
              className="
                mt-6 flex items-center justify-center gap-2
                text-sm text-blue-600 dark:text-blue-400
                hover:underline mx-auto
              "
            >
              <ArrowLeft size={14} />
              Back to login
            </button>
          </>
        ) : (
          <div className="text-center py-6">
            <div
              className="
                w-14 h-14 mx-auto mb-4 rounded-full
                bg-green-500/10 dark:bg-green-500/15
                flex items-center justify-center
              "
            >
              <Mail className="text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Email sent
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              If an account exists for this email, a password reset link has been sent.
              <br />
              Please check your inbox and spam folder.
            </p>

            <button
              onClick={() => navigate("/auth?mode=login")}
              className="
                mt-6 text-sm font-medium
                text-blue-600 dark:text-blue-400
                hover:underline
              "
            >
              Back to login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
