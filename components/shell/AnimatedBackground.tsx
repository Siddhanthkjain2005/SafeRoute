"use client";
import { motion } from "framer-motion";

/**
 * Obsidian command-center backdrop:
 *  • near-black base with a soft top vignette
 *  • one slow-breathing emerald signal glow + a faint teal counter-glow
 *  • fine dot-matrix field fading toward the fold
 *  • a single horizon line under the top bar for depth
 * Pure CSS/Framer — GPU-cheap, sits behind all content (-z-10), pointer-none.
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 50% -8%, hsl(160 10% 7%) 0%, hsl(160 8% 4%) 50%, hsl(160 10% 3%) 100%)",
        }}
      />

      {/* emerald signal glow */}
      <motion.div
        className="absolute left-[12%] top-[-18%] h-[60vh] w-[60vh] rounded-full blur-[140px] animate-aurora-1"
        style={{ background: "radial-gradient(circle, hsl(160 84% 40% / 0.14), transparent 60%)" }}
      />
      {/* teal counter-glow */}
      <motion.div
        className="absolute bottom-[-22%] right-[2%] h-[52vh] w-[52vh] rounded-full blur-[150px] animate-aurora-2"
        style={{ background: "radial-gradient(circle, hsl(172 70% 45% / 0.08), transparent 60%)" }}
      />

      {/* dot-matrix field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "26px 26px",
          backgroundImage: "radial-gradient(hsl(160 8% 85% / 0.05) 1px, transparent 1px)",
          maskImage: "radial-gradient(110% 75% at 50% 0%, #000 25%, transparent 85%)",
        }}
      />

      {/* horizon line */}
      <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

      {/* film grain / noise */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
