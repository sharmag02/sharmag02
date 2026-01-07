/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ REQUIRED FOR GLOBAL THEME
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      /* ---------------- TYPOGRAPHY ---------------- */
      typography: {
        DEFAULT: {
          css: {
            table: {
              width: "100%",
              borderCollapse: "collapse",
            },
            th: {
              border: "1px solid #e5e7eb",
              padding: "0.5rem",
              backgroundColor: "#f8fafc",
              fontWeight: "600",
            },
            td: {
              border: "1px solid #e5e7eb",
              padding: "0.5rem",
            },
            pre: {
              backgroundColor: "#0f172a",
              color: "#e5e7eb",
              padding: "1rem",
              borderRadius: "0.75rem",
              overflowX: "auto",
            },
            code: {
              backgroundColor: "#f1f5f9",
              padding: "0.2rem 0.4rem",
              borderRadius: "0.25rem",
              fontWeight: "500",
            },
            blockquote: {
              borderLeftColor: "#6366f1",
              fontStyle: "italic",
            },
            img: {
              borderRadius: "0.75rem",
            },
          },
        },
      },

      /* ---------------- ANIMATIONS ---------------- */
      animation: {
        float: "float 3s ease-in-out infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
