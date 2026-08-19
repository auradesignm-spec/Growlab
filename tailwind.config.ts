import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        growlab: {
          bg: "#0E2621",
          bgDark: "#081714",
          bgSurface: "#13352E",
          bgCard: "#112B26",
          ledger: "#0B1F1B",
          border: "#1C433B",
          borderLight: "#26574D",
          gold: "#AD7A2A",
          goldLight: "#C99746",
          goldMuted: "#E5BE78",
          emerald: "#10B981",
          emeraldLight: "#34D399",
          emeraldGlow: "rgba(16, 185, 129, 0.25)",
        },
        dark: {
          DEFAULT: "#0E2621",
          1: "#081714",
          2: "#112B26",
          3: "#163832",
          card: "#112B26",
          border: "#1C433B",
          line: "rgba(255, 255, 255, 0.08)",
        },
        gold: {
          DEFAULT: "#AD7A2A",
          soft: "#C99746",
          light: "#E5BE78",
          glow: "rgba(173, 122, 42, 0.25)",
        },
        emerald: {
          DEFAULT: "#10B981",
          soft: "#34D399",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          soft: "#22D3EE",
          glow: "rgba(6, 182, 212, 0.25)",
        },
        muted: "#8FA8A2",
        onDark: "#F2F7F5",
        onDarkSoft: "#9DB5AF",
      },
      fontFamily: {
        display: ["var(--font-cairo)", "var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-plex-arabic)", "var(--font-jakarta)", "sans-serif"],
        en: ["var(--font-jakarta)", "sans-serif"],
        ar: ["var(--font-cairo)", "var(--font-plex-arabic)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      maxWidth: {
        wrap: "1320px",
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        "glow-gold": "0 0 35px -5px rgba(173, 122, 42, 0.3)",
        "glow-emerald": "0 0 35px -5px rgba(16, 185, 129, 0.3)",
        "glow-dark": "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
