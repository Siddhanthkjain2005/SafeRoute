"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Flame, Hammer, Moon, Network, Volume2, Waves, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  {
    key: "night_intrusion", label: "Night Intrusion", icon: Activity, accent: "#f97316",
    frames: [
      { darkness: 0.85 },
      { motion: true, darkness: 0.85 },
      { motion: true, sound: 0.7, darkness: 0.85 },
      { motion: true, vibration: true, sound: 0.8, darkness: 0.85 },
    ], gap: 850,
  },
  {
    key: "tampering", label: "Tampering", icon: Hammer, accent: "#fbbf24",
    frames: [
      { vibration: true, sound: 0.6, darkness: 0.7 },
      { vibration: true, sound: 0.72, darkness: 0.7 },
      { vibration: true, motion: true, sound: 0.9, darkness: 0.7 },
    ], gap: 850,
  },
  {
    key: "fire_hazard", label: "Fire Hazard", icon: Flame, accent: "#f43f5e",
    frames: [{ smoke: 0.5 }, { smoke: 0.82, sound: 0.5 }, { smoke: 0.96, motion: true }], gap: 850,
  },
  {
    key: "multi_zone", label: "Multi-zone", icon: Network, accent: "#38bdf8", multi: true,
    frames: [], gap: 0,
  },
];

const MANUAL = [
  { key: "motion", label: "Motion", icon: Activity, frame: { motion: true, darkness: 0.8 } },
  { key: "vibration", label: "Vibration", icon: Waves, frame: { vibration: true, darkness: 0.8 } },
  { key: "smoke", label: "Smoke", icon: Flame, frame: { smoke: 0.9 } },
  { key: "sound", label: "Sound", icon: Volume2, frame: { sound: 0.85, darkness: 0.8 } },
  { key: "darkness", label: "Darkness", icon: Moon, frame: { darkness: 0.95 } },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function SimulatorPanel() {
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 8));
  const fire = (node: string, frame: Record<string, unknown>) =>
    api.simulate({ node_id: node, ...frame });

  const runScenario = async (s: (typeof SCENARIOS)[number]) => {
    setBusy(s.key);
    push(`▶ ${s.label} initiated`);
    try {
      if (s.multi) {
        await fire("zone-a", { motion: true, darkness: 0.8 }); await sleep(600);
        await fire("zone-b", { motion: true, darkness: 0.8 }); await sleep(600);
        await fire("virtual-3", { motion: true, sound: 0.7, darkness: 0.8 }); await sleep(600);
        await fire("zone-a", { motion: true, vibration: true, darkness: 0.8 });
        await fire("virtual-3", { motion: true, vibration: true, darkness: 0.8 });
      } else {
        for (const f of s.frames) { await fire("virtual-3", f); await sleep(s.gap); }
      }
      push(`✔ ${s.label} complete`);
    } catch {
      push(`✘ ${s.label} failed — backend offline?`);
    } finally {
      setBusy(null);
    }
  };

  const trigger = async (m: (typeof MANUAL)[number]) => {
    try { await fire("virtual-3", m.frame); push(`• injected ${m.label}`); }
    catch { push(`✘ ${m.label} failed`); }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="stat-label mb-2.5">Attack Scenarios</div>
        <div className="grid grid-cols-2 gap-2">
          {SCENARIOS.map((s) => (
            <motion.button
              key={s.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => runScenario(s)}
              disabled={!!busy}
              className={cn(
                "group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-hairline/12 bg-surface-2/50 px-3 py-2.5 text-left text-sm font-medium text-content transition-colors hover:text-content-strong disabled:opacity-50",
                busy === s.key && "ring-1 ring-accent/40"
              )}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg ring-1"
                style={{ background: `${s.accent}1a`, color: s.accent, borderColor: `${s.accent}44` }}
              >
                <s.icon className="h-4 w-4" />
              </span>
              {s.label}
              {busy === s.key && (
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5"
                  style={{ background: s.accent }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: (s.frames.length || 5) * 0.85 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <div className="stat-label mb-2.5">Manual Triggers · Virtual Node</div>
        <div className="flex flex-wrap gap-2">
          {MANUAL.map((m) => (
            <motion.button
              key={m.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => trigger(m)}
              className="flex items-center gap-1.5 rounded-lg border border-hairline/12 bg-surface-3/40 px-2.5 py-1.5 text-[13px] text-content-muted transition-colors hover:text-content-strong"
            >
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <div className="stat-label mb-2.5 flex items-center gap-1.5">
          <Zap className="h-3 w-3" /> Injection Log
        </div>
        <div className="num space-y-1 rounded-lg border border-hairline/10 bg-surface-0/50 p-3 text-[11px] text-content-muted">
          {log.length ? (
            log.map((l, i) => <div key={i}>{l}</div>)
          ) : (
            <div className="text-content-faint">no activity yet — trigger a scenario</div>
          )}
        </div>
      </div>
    </div>
  );
}
