"use client";
import { useEffect, useRef } from "react";
import { useLiveStore } from "@/lib/store";
import { threatMeta } from "@/lib/utils";

/**
 * Security Pulse — a continuously scrolling EKG-style waveform that emits a
 * spike each time a live event arrives. Rendered on a canvas with rAF so it
 * stays smooth without re-rendering React. Colour tracks the latest threat.
 */
export function SecurityPulse({ height = 80 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulse = useLiveStore((s) => s.pulse);
  const lastEvent = useLiveStore((s) => s.events[0]);
  const pulseRef = useRef(pulse);
  const colorRef = useRef("#5b8cff");

  useEffect(() => {
    pulseRef.current = pulse; // trigger a spike when this changes
    colorRef.current = lastEvent ? threatMeta(lastEvent.threat_level).hex : "#5b8cff";
  }, [pulse, lastEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const buf: number[] = [];
    let lastPulse = pulseRef.current;
    let spikeT = 0; // remaining samples of an active spike

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      if (buf.length === 0) for (let i = 0; i < Math.ceil(w / 2); i++) buf.push(0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let phase = 0;
    const tick = () => {
      // detect a new event → start a spike envelope
      if (pulseRef.current !== lastPulse) {
        lastPulse = pulseRef.current;
        spikeT = 8;
      }
      phase += 0.18;
      // baseline: gentle idle sine + noise; spike: sharp EKG blip
      let v = Math.sin(phase) * 2 + (Math.random() - 0.5) * 2;
      if (spikeT > 0) {
        const k = spikeT;
        v += (k > 5 ? (8 - k) * 9 : k * 6) * (k % 2 === 0 ? 1 : -0.6);
        spikeT--;
      }
      buf.push(v);
      while (buf.length > Math.ceil(w / 2)) buf.shift();

      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const color = colorRef.current;

      // grid baseline
      ctx.strokeStyle = "rgba(148,163,184,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      // waveform
      ctx.beginPath();
      buf.forEach((val, i) => {
        const x = i * 2;
        const y = mid - val * (h / 28);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // leading dot
      const lastY = mid - buf[buf.length - 1] * (h / 28);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(buf.length * 2, lastY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full" style={{ height }} />;
}
