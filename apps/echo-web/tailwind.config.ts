import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/echo-ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        echo: {
          bg: {
            primary: "#060a13",
            surface: "#0d1425",
            elevated: "#141d32"
          },
          accent: "#6366f1",
          glow: "#818cf8",
          success: "#10b981",
          gold: "#f59e0b",
          text: {
            primary: "#f1f5f9",
            muted: "#94a3b8"
          },
          border: "rgba(99,102,241,0.15)"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
