/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', "Impact", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
        sans: ['"DM Mono"', "ui-monospace", "system-ui", "sans-serif"],
      },
      colors: {
        arb: {
          bg: "var(--arb-bg)",
          surface: "var(--arb-surface)",
          border: "var(--arb-border)",
          accent: "var(--arb-accent)",
          pro: "var(--arb-pro)",
          against: "var(--arb-against)",
          muted: "var(--arb-muted)",
          text: "var(--arb-text)",
        },
        ink: {
          950: "#07080c",
          900: "#0c0e14",
          800: "#13161f",
          700: "#1c2130",
        },
        mist: "#94a3b8",
        accent: {
          DEFAULT: "#e8ff47",
          dim: "#c8db3a",
          glow: "#f4ff8a",
        },
        teal: { glow: "#2dd4bf" },
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(30, 30, 34, 0.9), 0 24px 48px -12px rgba(0,0,0,0.65)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "eval-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out forwards",
        "eval-pulse": "eval-pulse 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
