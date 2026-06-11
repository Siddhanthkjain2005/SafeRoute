"use client";
import { motion } from "framer-motion";

/**
 * Modern premium backdrop:
 *  • deep navy base gradient
 *  • vibrant cyan and orange aurora blobs for brand colors
 *  • subtle grid for tech feel
 *  • dynamic scanline for live system aesthetic
 * Pure CSS/Framer — GPU-optimized, sits behind all content (-z-10), pointer-none.
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 140% 110% at 50% 0%, hsl(217 35% 12%) 0%, hsl(217 30% 8%) 50%, hsl(217 35% 6%) 100%)",
        }}
      />

      {/* brand aurora blobs - cyan and orange */}
      <motion.div
        className="absolute left-[5%] top-[-15%] h-[60vh] w-[60vh] rounded-full blur-[140px] animate-aurora-1"
        style={{ background: "radial-gradient(circle, hsl(186 100% 52% / 0.25), transparent 65%)" }}
      />
      <motion.div
        className="absolute right-[6%] top-[8%] h-[50vh] w-[50vh] rounded-full blur-[150px] animate-aurora-2"
        style={{ background: "radial-gradient(circle, hsl(15 100% 55% / 0.18), transparent 65%)" }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-[40%] h-[55vh] w-[55vh] rounded-full blur-[160px] animate-aurora-1"
        style={{ background: "radial-gradient(circle, hsl(240 90% 60% / 0.12), transparent 65%)" }}
      />

      {/* premium grid with accent colors */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(hsl(186 80% 55% / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(186 80% 55% / 0.04) 1px, transparent 1px)",
          maskImage: "radial-gradient(ellipse 130% 90% at 50% 0%, #000 20%, transparent 85%)",
        }}
      />

      {/* dynamic scanline */}
      <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

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
