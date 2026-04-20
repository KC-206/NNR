import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 80px rgba(255, 163, 210, 0.12)",
      },
      backgroundImage: {
        vignette:
          "radial-gradient(circle at center, transparent 38%, rgba(0, 0, 0, 0.3) 68%, rgba(0, 0, 0, 0.82) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
