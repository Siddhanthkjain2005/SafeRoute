"use client";

/**
 * Light futuristic backdrop:
 *  • warm pearl base wash
 *  • soft, slow-drifting aurora blobs (indigo · ocean · teal) at low opacity
 *  • faint engineering grid that fades toward the edges
 * Pure CSS — GPU-cheap, sits behind all content (-z-10), pointer-none.
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, hsl(228 60% 99%) 0%, hsl(228 40% 98%) 50%, hsl(228 36% 96%) 100%)",
        }}
      />

      {/* aurora blobs */}
      <div
        className="absolute left-[-6%] top-[-10%] h-[52vh] w-[52vh] rounded-full blur-[120px] animate-blob-1"
        style={{ background: "radial-gradient(circle, hsl(248 70% 56% / 0.16), transparent 62%)" }}
      />
      <div
        className="absolute right-[-4%] top-[2%] h-[46vh] w-[46vh] rounded-full blur-[130px] animate-blob-2"
        style={{ background: "radial-gradient(circle, hsl(208 92% 52% / 0.14), transparent 62%)" }}
      />
      <div
        className="absolute bottom-[-16%] left-[34%] h-[48vh] w-[48vh] rounded-full blur-[140px] animate-blob-1"
        style={{ background: "radial-gradient(circle, hsl(174 70% 41% / 0.12), transparent 62%)" }}
      />

      {/* engineering grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "46px 46px",
          backgroundImage:
            "linear-gradient(hsl(230 24% 56% / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(230 24% 56% / 0.05) 1px, transparent 1px)",
          maskImage: "radial-gradient(120% 75% at 50% 0%, #000 25%, transparent 88%)",
          WebkitMaskImage: "radial-gradient(120% 75% at 50% 0%, #000 25%, transparent 88%)",
        }}
      />
    </div>
  );
}
