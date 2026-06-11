"use client";
import { motion } from "framer-motion";

/**
 * Layered command-center backdrop:
 *  • deep radial vignette
 *  • two slow-drifting aurora blobs (electric blue + purple/cyan)
 *  • faint engineering grid
 *  • a single slow scanline for "live system" feel
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
            "radial-gradient(120% 90% at 50% -10%, hsl(222 60% 8%) 0%, hsl(222 47% 4%) 55%, hsl(222 50% 3%) 100%)",
        }}
      />

      {/* aurora blobs */}
      <motion.div
        className="absolute left-[8%] top-[-12%] h-[55vh] w-[55vh] rounded-full blur-[120px] animate-aurora-1"
        style={{ background: "radial-gradient(circle, hsl(222 100% 60% / 0.28), transparent 60%)" }}
      />
      <motion.div
        className="absolute right-[4%] top-[6%] h-[48vh] w-[48vh] rounded-full blur-[130px] animate-aurora-2"
        style={{ background: "radial-gradient(circle, hsl(265 90% 65% / 0.22), transparent 60%)" }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-[35%] h-[50vh] w-[50vh] rounded-full blur-[140px] animate-aurora-1"
        style={{ background: "radial-gradient(circle, hsl(190 95% 55% / 0.14), transparent 60%)" }}
      />

      {/* engineering grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundSize: "44px 44px",
          backgroundImage:
            "linear-gradient(hsl(215 30% 60% / 0.035) 1px, transparent 1px), linear-gradient(90deg, hsl(215 30% 60% / 0.035) 1px, transparent 1px)",
          maskImage: "radial-gradient(120% 80% at 50% 0%, #000 30%, transparent 90%)",
        }}
      />

      {/* scanline */}
      <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* film grain / noise */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
