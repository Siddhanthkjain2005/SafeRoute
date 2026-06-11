import type { Config } from "tailwindcss";

const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: hsl("--canvas"),
        surface: {
          0: hsl("--surface-0"),
          1: hsl("--surface-1"),
          2: hsl("--surface-2"),
        },
        hairline: hsl("--hairline"),
        primary: {
          DEFAULT: hsl("--primary"),
          soft: hsl("--primary-soft"),
        },
        secondary: hsl("--secondary"),
        accent: hsl("--accent"),
        highlight: hsl("--highlight"),
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
        sans: ["var(--font-sans-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono-geist)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--primary) / 0.18), 0 18px 50px -16px hsl(var(--primary) / 0.4)",
        soft: "0 12px 32px -16px hsl(232 38% 24% / 0.16)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "mesh-1": {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(6%,-4%) scale(1.1)" },
          "66%": { transform: "translate(-4%,6%) scale(0.95)" },
        },
        "mesh-2": {
          "0%,100%": { transform: "translate(0,0) scale(1.08)" },
          "50%": { transform: "translate(-8%,5%) scale(0.92)" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-24" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "mesh-1": "mesh-1 24s ease-in-out infinite",
        "mesh-2": "mesh-2 28s ease-in-out infinite",
        "dash-flow": "dash-flow 0.8s linear infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
