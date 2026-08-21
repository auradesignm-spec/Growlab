import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
          muted: "#C9A86A",
        },
        teal: {
          DEFAULT: "#1F6F5C",
          soft: "#E4EEEA",
          muted: "#F2F7F4",
        },
        line: "#D7DBD1",
        ink_text: "#12241F",
        muted: "#4B564E",
        onDark: "#F1F3EE",
        onDarkSoft: "#B9C6BE",
        danger: "#9B4B3B",
        goldText: "#241A08",
      },
      fontFamily: {
        display: ["var(--font-cairo)", "sans-serif"],
        body: ["var(--font-plex-arabic)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      fontSize: {
        "display-lg": ["clamp(2.25rem,5vw,3.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.875rem,3vw,2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        wrap: "1120px",
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 38, 33, 0.04), 0 8px 24px rgba(14, 38, 33, 0.06)",
        "card-hover": "0 4px 8px rgba(14, 38, 33, 0.06), 0 16px 40px rgba(14, 38, 33, 0.1)",
        header: "0 1px 0 rgba(14, 38, 33, 0.06)",
        glow: "0 0 0 3px rgba(173, 122, 42, 0.25)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #0E2621 0%, #153730 45%, #1D453C 100%)",
        "gradient-gold": "linear-gradient(135deg, #AD7A2A 0%, #C9A86A 100%)",
        "gradient-teal-soft": "linear-gradient(180deg, #E4EEEA 0%, #F2F7F4 100%)",
        "gradient-radial-gold": "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(173,122,42,0.12) 0%, transparent 70%)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", maxHeight: "0" },
          "100%": { opacity: "1", maxHeight: "480px" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "var(--line-length, 1000)" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-down": "fade-in-down 0.35s ease-out forwards",
        "slide-down": "slide-down 0.35s ease-out forwards",
        "draw-line": "draw-line 1.8s ease-out forwards",
      },
      spacing: {
        section: "clamp(5rem, 8vw, 6rem)",
        "section-sm": "clamp(4rem, 6vw, 5rem)",
      },
    },
  },
  plugins: [],
};

export default config;
