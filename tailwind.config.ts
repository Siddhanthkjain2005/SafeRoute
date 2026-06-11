import type { Config } from "tailwindcss";

const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: hsl("--surface-0"),
          1: hsl("--surface-1"),
          2: hsl("--surface-2"),
          3: hsl("--surface-3"),
        },
        hairline: hsl("--hairline"),
        accent: {
          DEFAULT: hsl("--accent"),
          teal: hsl("--accent-2"),
          violet: hsl("--accent-3"),
          ocean: hsl("--accent-ocean"),
          amber: hsl("--accent-amber"),
          red: hsl("--accent-red"),
        },
        threat: {
          safe: hsl("--t-safe"),
          low: hsl("--t-low"),
          medium: hsl("--t-medium"),
          high: hsl("--t-high"),
          critical: hsl("--t-critical"),
          emergency: hsl("--t-emergency"),
        },
        content: {
          strong: hsl("--text-strong"),
          DEFAULT: hsl("--text"),
          muted: hsl("--text-muted"),
          faint: hsl("--text-faint"),
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 10px 36px -10px hsl(var(--accent) / 0.45)",
        "glow-soft": "0 0 30px -6px hsl(var(--accent) / 0.3)",
        lift: "0 24px 60px -24px hsl(230 50% 30% / 0.28)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.55" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "blob-1": {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(6%,-5%) scale(1.12)" },
          "66%": { transform: "translate(-5%,7%) scale(0.94)" },
        },
        "blob-2": {
          "0%,100%": { transform: "translate(0,0) scale(1.1)" },
          "50%": { transform: "translate(-8%,5%) scale(0.92)" },
        },
        dash: { to: { strokeDashoffset: "-1000" } },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 7s ease-in-out infinite",
        "blob-1": "blob-1 24s ease-in-out infinite",
        "blob-2": "blob-2 28s ease-in-out infinite",
        dash: "dash 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
