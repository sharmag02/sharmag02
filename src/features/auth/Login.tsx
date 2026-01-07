import { useState } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface LoginProps {
  onToggleMode: () => void;
}

export function Login({ onToggleMode }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as any)?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-12 h-12 rounded-full
                     bg-blue-600/10 dark:bg-blue-500/15
                     flex items-center justify-center mb-3"
        >
          <LogIn className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Sign in to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ERROR */}
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm
                       bg-red-500/10 dark:bg-red-500/15
                       border border-red-500/20
                       text-red-700 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg
                     bg-white dark:bg-slate-800
                     border border-slate-300 dark:border-white/10
                     text-slate-900 dark:text-white
                     placeholder-slate-400 dark:placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg
                       bg-white dark:bg-slate-800
                       border border-slate-300 dark:border-white/10
                       text-slate-900 dark:text-white
                       placeholder-slate-400 dark:placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-slate-500 hover:text-blue-500
                       dark:text-slate-400 dark:hover:text-blue-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold
                     bg-blue-600 hover:bg-blue-700
                     text-white transition
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {/* FOOTER */}
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don’t have an account?{" "}
        <button
          onClick={onToggleMode}
          className="text-blue-500 font-medium hover:underline"
        >
          Sign up
        </button>
      </p>
    </motion.div>
  );
}
