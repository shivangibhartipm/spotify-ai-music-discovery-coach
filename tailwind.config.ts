import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          "green-hover": "#1ED760",
          black: "#050505",
          charcoal: "#121212",
          graphite: "#181818",
          slate: "#232323",
          muted: "#A7A7A7",
          white: "#FFFFFF",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(29, 185, 84, 0.22)",
        card: "0 24px 80px rgba(0, 0, 0, 0.28)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
