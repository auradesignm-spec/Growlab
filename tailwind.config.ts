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
        gold: {
          DEFAULT: "#A6822E",
          soft: "#C9A85C",
          wash: "#EBE0C4",
        },
        ink_text: "#0A0908",
        muted: "#6B6458",
        onDark: "#E8E6E1",
        onDarkSoft: "#A89B86",
        danger: "#D4675C",
        ok: {
          DEFAULT: "#6F9B7C",
          soft: "#8FB59A",
        },
        warn: "#C4A35A",

        night: {
          DEFAULT: "#F7F8FA",
          soft: "#FFFFFF",
          deep: "#EEF1F4",
          raised: "#FFFFFF",
        },
        frost: {
          DEFAULT: "#111318",
          dim: "#5C6573",
          faint: "#8B93A1",
        },
        line: "rgba(17,19,24,0.08)",
        // Azure is charts and focus only. Primary buttons use frost (ink).
        signal: {
          DEFAULT: "#1F6FEB",
          soft: "#2563C4",
          bright: "#1A5BD4",
          dim: "#D6E4FA",
        },
        // Meaning-only success. Do not use for decoration.
        pulse: {
          DEFAULT: "#6F9B7C",
          soft: "#8FB59A",
        },
      },
      fontFamily: {
        display: ["var(--font-plex-arabic)", "sans-serif"],
        body: ["var(--font-plex-arabic)", "sans-serif"],
        west: ["var(--font-plex-arabic)", "sans-serif"],
        serif: ["var(--font-plex-arabic)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
        brand: ["var(--font-brand)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(1.75rem,4.2vw,3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(1.5rem,2.4vw,2rem)", { lineHeight: "1.2" }],
        "display-md": ["clamp(1.25rem,2vw,1.5rem)", { lineHeight: "1.25" }],
      },
      maxWidth: {
        wrap: "1200px",
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
      spacing: {
        section: "clamp(3.25rem, 8vw, 7.5rem)",
      },
      boxShadow: {
        overlay: "0 1px 2px rgba(15,23,42,0.05)",
        card: "0 1px 2px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
