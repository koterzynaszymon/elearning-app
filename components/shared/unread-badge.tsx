import { cn } from "@/lib/utils";

const DISPLAY_CAP = 9;

interface UnreadBadgeProps {
  readonly count: number;
  readonly inverted?: boolean;
  readonly className?: string;
}

/** Small pulsing count pill; renders nothing when the count is zero. */
export function UnreadBadge({
  count,
  inverted = false,
  className,
}: UnreadBadgeProps): React.JSX.Element | null {
  if (count <= 0) return null;

  const label = `${count} new ${count === 1 ? "answer" : "answers"}`;

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-label={label}
      title={label}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 animate-ping rounded-full opacity-40 [animation-iteration-count:3]",
          inverted ? "bg-primary-foreground" : "bg-primary",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "relative min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-extrabold leading-none tabular-nums",
          inverted
            ? "bg-primary-foreground text-primary"
            : "bg-primary text-primary-foreground shadow-glow",
        )}
      >
        {count > DISPLAY_CAP ? `${DISPLAY_CAP}+` : count}
      </span>
    </span>
  );
}
