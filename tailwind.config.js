/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0d1210",
        panel:   "#111a17",
        card:    "#162019",
        border:  "#1f3028",
        accent:  "#34d399",
        "accent-dim": "#10b981",
        muted:   "#6b8f7e",
        soft:    "#e0f2ec",
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};