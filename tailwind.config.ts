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
          cyan: hsl("--accent-2"),
          purple: hsl("--accent-3"),
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
        sans: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--accent) / 0.3), 0 6px 28px -8px hsl(var(--accent) / 0.5)",
        "glow-soft": "0 0 24px -6px hsl(var(--accent) / 0.35)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.65" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        sweep: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "aurora-1": {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(8%,-6%) scale(1.15)" },
          "66%": { transform: "translate(-6%,8%) scale(0.95)" },
        },
        "aurora-2": {
          "0%,100%": { transform: "translate(0,0) scale(1.1)" },
          "50%": { transform: "translate(-10%,6%) scale(0.9)" },
        },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100vh)" } },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.4,0,0.6,1) infinite",
        sweep: "sweep 4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "aurora-1": "aurora-1 22s ease-in-out infinite",
        "aurora-2": "aurora-2 26s ease-in-out infinite",
        scan: "scan 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
