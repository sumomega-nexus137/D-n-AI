/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Глубокий тёплый «почти чёрный» с оттенком — не плоская чернота
        base: {
          950: "#050506",
          900: "#0a0a0c",
          850: "#101014",
          800: "#16161c",
          750: "#1e1e26",
          700: "#282833",
        },
        gold: {
          200: "#fbe7b8",
          300: "#f7d488",
          400: "#f0c05a",
          500: "#e2a63a",
          600: "#c1852a",
        },
        moss: {
          300: "#8ef0be",
          400: "#4fdd9b",
          500: "#22c07e",
          600: "#149463",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Inter Tight'", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      boxShadow: {
        glow: "0 0 90px -20px rgba(240, 192, 90, 0.5)",
        "glow-moss": "0 0 90px -20px rgba(79, 221, 155, 0.45)",
        card: "0 30px 80px -40px rgba(0, 0, 0, 0.95)",
        "inner-hi": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backdropBlur: {
        xl: "24px",
      },
      keyframes: {
        "aurora-shift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.55" },
          "50%": { transform: "translate3d(4%, -3%, 0) scale(1.12)", opacity: "0.8" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        aurora: "aurora-shift 16s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
