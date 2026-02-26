import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020817",
        surface: "#020617",
        accent: "#22c55e",
        muted: "#1e293b",
      },
    },
  },
  plugins: [],
};

export default config;

