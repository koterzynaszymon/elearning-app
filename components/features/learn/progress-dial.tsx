import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FULL_PROGRESS = 100;

interface ProgressDialProps {
  readonly completed: number;
  readonly total: number;
  /** Tailwind size utilities, e.g. "h-20 w-20". */
  readonly className?: string;
  readonly tone?: "brand" | "inverted";
}

export function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  const ratio = Math.min(completed, total) / total;
  return Math.round(ratio * FULL_PROGRESS);
}

export function ProgressDial({
  completed,
  total,
  className,
  tone = "brand",
}: ProgressDialProps): React.JSX.Element {
  const percent = progressPercent(completed, total);
  const isDone = total > 0 && completed >= total;
  const dashOffset = RING_CIRCUMFERENCE * (1 - percent / FULL_PROGRESS);

  const track = tone === "inverted" ? "stroke-background/30" : "stroke-secondary";
  const bar =
    tone === "inverted"
      ? "stroke-background"
      : isDone
        ? "stroke-mint"
        : "stroke-primary";
  const label = tone === "inverted" ? "text-primary-foreground" : "text-foreground";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      role="img"
      aria-label={`${percent}% complete, ${completed} of ${total} lessons`}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          className={track}
        />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            bar,
          )}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span
        className={cn(
          "absolute font-display text-sm font-extrabold tabular-nums",
          isDone && tone === "brand" ? "text-mint" : label,
        )}
      >
        {isDone ? <CheckCircle2 className="h-5 w-5" /> : `${percent}%`}
      </span>
    </div>
  );
}
