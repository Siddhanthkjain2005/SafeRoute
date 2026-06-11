"use client";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

/** Smoothly animates a number toward `value` (premium count-up feel). */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1,
  className,
  style,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, duration, mv]);

  return (
    <motion.span className={className} style={style}>
      {rounded}
    </motion.span>
  );
}
