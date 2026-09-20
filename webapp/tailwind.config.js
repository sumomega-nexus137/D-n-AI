/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07090c",
          900: "#0b0e13",
          850: "#0f131a",
          800: "#141922",
          700: "#1c2230",
          600: "#262e3d",
        },
        grain: {
          400: "#f2c261",
          500: "#e0a83c",
          600: "#c08a29",
        },
        leaf: {
          400: "#5fd38d",
          500: "#34b972",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(224, 168, 60, 0.45)",
        card: "0 24px 64px -32px rgba(0, 0, 0, 0.9)",
      },
    },
  },
  plugins: [],
};
