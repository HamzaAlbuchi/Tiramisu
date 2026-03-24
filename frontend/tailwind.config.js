/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Instrument Sans", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#07080c",
          900: "#0c0e14",
          800: "#13161f",
          700: "#1c2130",
        },
        mist: "#94a3b8",
        accent: {
          DEFAULT: "#7c3aed",
          dim: "#5b21b6",
          glow: "#a78bfa",
        },
        teal: { glow: "#2dd4bf" },
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 24px 48px -12px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
