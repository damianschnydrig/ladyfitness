import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/emails/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#e6007e",
          "pink-dark": "#c4006a",
          "pink-light": "#fce4f1",
          dark: "#111111",
          muted: "#6b6b6b",
          border: "#e0d6da",
          alt: "#f5f0f2",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(17, 17, 17, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
