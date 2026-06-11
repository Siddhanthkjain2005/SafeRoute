import { cn, threatMeta } from "@/lib/utils";
import type { ThreatLevel } from "@/lib/types";

export function ThreatBadge({
  level,
  pulse = false,
  className,
}: {
  level: ThreatLevel;
  pulse?: boolean;
  className?: string;
}) {
  const m = threatMeta(level);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] ring-1",
        m.bg,
        m.text,
        m.ring,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: m.hex }}
          />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: m.hex }} />
      </span>
      {m.label}
    </span>
  );
}
