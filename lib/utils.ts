import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ThreatLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ThreatStyle {
  label: string;
  text: string; // tailwind text color
  bg: string; // tinted background
  ring: string;
  hex: string; // raw color for SVG/canvas
  glow: string;
}

export const THREAT_META: Record<ThreatLevel, ThreatStyle> = {
  safe: { label: "Safe", text: "text-threat-safe", bg: "bg-threat-safe/10", ring: "ring-threat-safe/30", hex: "#12b76a", glow: "rgba(18,183,106,0.5)" },
  low: { label: "Low", text: "text-threat-low", bg: "bg-threat-low/10", ring: "ring-threat-low/30", hex: "#38bdf8", glow: "rgba(56,189,248,0.5)" },
  medium: { label: "Medium", text: "text-threat-medium", bg: "bg-threat-medium/10", ring: "ring-threat-medium/30", hex: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
  high: { label: "High", text: "text-threat-high", bg: "bg-threat-high/10", ring: "ring-threat-high/30", hex: "#f97316", glow: "rgba(249,115,22,0.5)" },
  critical: { label: "Critical", text: "text-threat-critical", bg: "bg-threat-critical/15", ring: "ring-threat-critical/40", hex: "#ef4444", glow: "rgba(239,68,68,0.55)" },
  emergency: { label: "Emergency", text: "text-threat-emergency", bg: "bg-threat-emergency/15", ring: "ring-threat-emergency/40", hex: "#f43f5e", glow: "rgba(244,63,94,0.55)" },
};

export function threatMeta(level: ThreatLevel): ThreatStyle {
  return THREAT_META[level] ?? THREAT_META.safe;
}

export const ACCENT = {
  blue: "#12b76a", // primary signal (emerald)
  cyan: "#2dd4bf", // teal
  purple: "#38bdf8", // sky
  amber: "#fbbf24",
  red: "#ef4444",
};

export function levelFromScore(score: number): ThreatLevel {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  if (score >= 18) return "low";
  return "safe";
}

export function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

export function fmtClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour12: false });
  } catch {
    return iso;
  }
}

export function fmtRelative(iso: string | null): string {
  if (!iso) return "never";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const SENSOR_LABEL: Record<string, string> = {
  motion: "Motion",
  vibration: "Vibration",
  smoke: "Smoke",
  sound: "Sound",
  darkness: "Darkness",
};
