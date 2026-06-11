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
  safe: { label: "Safe", text: "text-threat-safe", bg: "bg-threat-safe/10", ring: "ring-threat-safe/25", hex: "#25a575", glow: "rgba(37,165,117,0.4)" },
  low: { label: "Low", text: "text-threat-low", bg: "bg-threat-low/10", ring: "ring-threat-low/25", hex: "#0e95e6", glow: "rgba(14,149,230,0.4)" },
  medium: { label: "Medium", text: "text-threat-medium", bg: "bg-threat-medium/12", ring: "ring-threat-medium/25", hex: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  high: { label: "High", text: "text-threat-high", bg: "bg-threat-high/12", ring: "ring-threat-high/30", hex: "#f0673a", glow: "rgba(240,103,58,0.42)" },
  critical: { label: "Critical", text: "text-threat-critical", bg: "bg-threat-critical/12", ring: "ring-threat-critical/30", hex: "#e0245e", glow: "rgba(224,36,94,0.45)" },
  emergency: { label: "Emergency", text: "text-threat-emergency", bg: "bg-threat-emergency/12", ring: "ring-threat-emergency/30", hex: "#dc2680", glow: "rgba(220,38,128,0.45)" },
};

export function threatMeta(level: ThreatLevel): ThreatStyle {
  return THREAT_META[level] ?? THREAT_META.safe;
}

export const ACCENT = {
  indigo: "#5b4dd6",
  ocean: "#1390e8",
  teal: "#1fae9b",
  violet: "#9b7df0",
  amber: "#f59e0b",
  red: "#e0245e",
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

/** Translate a 0–1 analog reading into human-friendly language per sensor.
 *  Higher reading = worse condition, so we invert phrasing where it helps. */
export function humanReading(key: string, value: number, on: boolean): string {
  const v = Math.max(0, Math.min(1, value));
  switch (key) {
    case "motion":
      return on ? "Detected" : "None";
    case "vibration":
      return on ? "Detected" : "None";
    case "sound":
      if (v < 0.2) return "Quiet";
      if (v < 0.45) return "Low";
      if (v < 0.7) return "Moderate";
      return "Loud";
    case "smoke":
      if (v < 0.15) return "Clear";
      if (v < 0.4) return "Trace";
      if (v < 0.7) return "Elevated";
      return "Heavy";
    case "darkness":
      // darkness high = poor visibility
      if (v < 0.25) return "Excellent";
      if (v < 0.5) return "Good";
      if (v < 0.75) return "Limited";
      return "Poor";
    default:
      return on ? "Active" : "Clear";
  }
}

/** A short reassuring or cautioning sentence for a safety score. */
export function safetyVerdict(score: number | null | undefined): string {
  if (score == null) return "Awaiting live readings.";
  if (score >= 80) return "Clear and well-lit. Comfortable to travel.";
  if (score >= 60) return "Generally calm with minor activity.";
  if (score >= 40) return "Some elevated readings. Stay aware.";
  if (score >= 20) return "Notable activity detected. Consider the alternative.";
  return "High risk right now. Avoid if possible.";
}
