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
  safe: { label: "Safe", text: "text-threat-safe", bg: "bg-threat-safe/10", ring: "ring-threat-safe/30", hex: "#1aa86a", glow: "rgba(26,168,106,0.4)" },
  low: { label: "Low", text: "text-threat-low", bg: "bg-threat-low/10", ring: "ring-threat-low/30", hex: "#1aa7b8", glow: "rgba(26,167,184,0.4)" },
  medium: { label: "Medium", text: "text-threat-medium", bg: "bg-threat-medium/12", ring: "ring-threat-medium/30", hex: "#f59f0a", glow: "rgba(245,159,10,0.4)" },
  high: { label: "High", text: "text-threat-high", bg: "bg-threat-high/12", ring: "ring-threat-high/30", hex: "#ef5f3c", glow: "rgba(239,95,60,0.45)" },
  critical: { label: "Critical", text: "text-threat-critical", bg: "bg-threat-critical/12", ring: "ring-threat-critical/40", hex: "#e11d48", glow: "rgba(225,29,72,0.5)" },
  emergency: { label: "Emergency", text: "text-threat-emergency", bg: "bg-threat-emergency/12", ring: "ring-threat-emergency/40", hex: "#db2777", glow: "rgba(219,39,119,0.5)" },
};

export function threatMeta(level: ThreatLevel): ThreatStyle {
  return THREAT_META[level] ?? THREAT_META.safe;
}

export const BRAND = {
  primary: "#4338ca", // deep indigo
  secondary: "#0d8de6", // ocean blue
  accent: "#1aaf9c", // teal
  highlight: "#8b5cf6", // soft violet
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
