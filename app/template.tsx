"use client";
import { motion } from "framer-motion";

/**
 * Route-level template — re-mounts on every navigation, so this wrapper
 * produces a smooth enter transition for each page (Linear/Vercel feel).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
