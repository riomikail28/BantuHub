import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16211f",
        muted: "#60706b",
        line: "#d9e2df",
        canvas: "#f7faf8",
        brand: {
          50: "#edfdf7",
          100: "#d2f7eb",
          500: "#20b486",
          600: "#14916d",
          700: "#0f7458",
        },
        amber: {
          500: "#f5a524",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(22, 33, 31, 0.08)",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
