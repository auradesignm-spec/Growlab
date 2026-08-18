import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E2621",
          2: "#153730",
          3: "#1D453C",
        },
        paper: {
          DEFAULT: "#F1F3EE",
          alt: "#E6E9E0",
        },
        gold: {
          DEFAULT: "#AD7A2A",
          soft: "#E7CFA0",
        },
        teal: "#1F6F5C",
        line: "#D7DBD1",
        ink_text: "#12241F",
        muted: "#4B564E",
        onDark: "#F1F3EE",
        onDarkSoft: "#B9C6BE",
        danger: "#9B4B3B",
      },
      fontFamily: {
        display: ["var(--font-cairo)", "sans-serif"],
        body: ["var(--font-plex-arabic)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      maxWidth: {
        wrap: "1120px",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
