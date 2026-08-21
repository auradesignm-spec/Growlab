import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        linen: {
          DEFAULT: "#E8DFD0",
          deep: "#D4C7B0",
          wash: "#F3EEE4",
        },
        obsidian: {
          DEFAULT: "#0A0908",
          soft: "#1A1714",
        },
        blood: {
          DEFAULT: "#8C1D18",
          deep: "#5C100E",
          wash: "#C45A4A",
        },
        ink_text: "#0A0908",
        muted: "#6B6458",
        line: "#C9BDA8",
        onDark: "#E8DFD0",
        onDarkSoft: "#A89B86",
        danger: "#8C1D18",
      },
      fontFamily: {
        display: ["var(--font-amiri)", "serif"],
        body: ["var(--font-plex-arabic)", "sans-serif"],
        west: ["var(--font-archivo)", "sans-serif"],
        serif: ["var(--font-newsreader)", "serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      fontSize: {
        mast: ["clamp(4.5rem,18vw,14rem)", { lineHeight: "0.82", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.75rem,7vw,6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.1rem,4.8vw,4rem)", { lineHeight: "1.05" }],
        "display-md": ["clamp(1.6rem,3vw,2.4rem)", { lineHeight: "1.15" }],
      },
      maxWidth: {
        wrap: "1440px",
      },
      borderRadius: {
        none: "0",
      },
      transitionTimingFunction: {
        heavy: "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      transitionDuration: {
        800: "800ms",
        1200: "1200ms",
      },
      keyframes: {
        "rise-slow": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        ken: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.08)" },
        },
      },
      animation: {
        "rise-slow": "rise-slow 1.4s heavy both",
        "fade-in": "fade-in 1.2s heavy both",
        ken: "ken 18s linear alternate infinite",
      },
      spacing: {
        section: "clamp(6rem, 14vw, 11rem)",
      },
    },
  },
  plugins: [],
};

export default config;
