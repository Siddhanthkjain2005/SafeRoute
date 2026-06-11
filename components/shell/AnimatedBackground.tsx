"use client";
import { motion } from "framer-motion";

/** Soft, organic aurora mesh that drifts behind everything. Light & premium. */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <motion.div
        className="absolute -left-[10%] -top-[15%] h-[60vh] w-[60vh] rounded-full opacity-70 blur-3xl animate-mesh-1"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.22), transparent 70%)" }}
      />
      <motion.div
        className="absolute right-[-8%] top-[-10%] h-[55vh] w-[55vh] rounded-full opacity-60 blur-3xl animate-mesh-2"
        style={{ background: "radial-gradient(circle, hsl(var(--secondary) / 0.18), transparent 70%)" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[10%] h-[55vh] w-[55vh] rounded-full opacity-60 blur-3xl animate-mesh-1"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.16), transparent 70%)" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-8%] h-[50vh] w-[50vh] rounded-full opacity-60 blur-3xl animate-mesh-2"
        style={{ background: "radial-gradient(circle, hsl(var(--highlight) / 0.16), transparent 70%)" }}
      />
    </div>
  );
}
