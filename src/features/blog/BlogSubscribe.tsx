import { useState } from "react";
import { supabase } from "../../shared/lib/supabase";

export function BlogSubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!email.trim()) return alert("Enter a valid email");

    setLoading(true);
    const { error } = await supabase
      .from("blog_subscribers")
      .insert([{ email: email.toLowerCase() }]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Subscribed successfully 🎉");
      setEmail("");
    }
  };

  return (
    <div
      className="
        mt-10 p-6 rounded-2xl
        bg-slate-100 dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        overflow-hidden
      "
    >
      <h3
        className="
          text-xl font-semibold mb-4
          text-slate-900 dark:text-slate-100
        "
      >
        Subscribe for new blogs
      </h3>

      {/* Responsive container */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="
            w-full px-4 py-2 rounded-lg
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />

        <button
          onClick={subscribe}
          disabled={loading}
          className="
            w-full sm:w-auto
            px-6 py-2 rounded-lg
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            transition
            disabled:opacity-60
          "
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
