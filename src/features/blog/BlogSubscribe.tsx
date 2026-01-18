import { useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { X } from "lucide-react";

export function BlogSubscribe() {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    }
  };

  return (
    <>
      {/* MAIN BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="
          px-6 py-3 rounded-xl
      bg-blue-600 text-white
      shadow-lg
      flex items-center gap-2
      hover:bg-blue-700
      hover:scale-105
      hover:shadow-[0_0_15px_#2563eb]
      transition-all duration-300
        "
      >
        Subscribe
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xl p-6 relative">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-slate-600 dark:text-slate-300"
            >
              <X />
            </button>

            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              Subscribe for new blogs
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Get notified when a new article is published ✨
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="
                w-full px-4 py-3 rounded-lg
                border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-slate-100
                placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />

            <button
              onClick={subscribe}
              disabled={loading}
              className="
                w-full mt-5
                px-6 py-3 rounded-lg
                bg-blue-600 hover:bg-blue-700
                text-white font-semibold
                transition disabled:opacity-60
              "
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
