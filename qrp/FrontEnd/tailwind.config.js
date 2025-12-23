/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"Dancing Script"', "cursive"],
        serif: ['"Playfair Display"', "serif"],
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
        inter: ["Inter", "sans-serif"],
        space: ["Space Grotesk", "sans-serif"],
        dancing: ["Dancing Script", "cursive"],
        playfair: ["Playfair Display", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
        pacifico: ["Pacifico", "cursive"],
        fredoka: ["Fredoka One", "cursive"],
      },
      colors: {
        blush: {
          50: "#fff7f8",
          100: "#ffeef1",
          200: "#ffd7df",
          300: "#ffc0cd",
          400: "#f7a2b6",
          500: "#e8839c",
        },
        studio: {
          bg: "#0f172a",
          surface: "rgba(30, 41, 59, 0.5)",
          border: "rgba(51, 65, 85, 0.5)",
          text: "#f1f5f9",
          "text-soft": "#cbd5e1",
          accent: "#ec4899",
        },
      },
      backgroundImage: {
        "studio-gradient":
          "radial-gradient(circle at 20% 20%, rgba(236,72,153,0.08), transparent 50%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.06), transparent 40%)",
      },
    },
  },
  plugins: [],
};
