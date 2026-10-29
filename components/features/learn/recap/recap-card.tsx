"use client";

import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecapCardProps {
  readonly id: string;
  readonly label: string;
  readonly tone: "brand" | "mint";
  readonly actions?: React.ReactNode;
  readonly onHide: () => void;
  readonly children: React.ReactNode;
}

const TONE_RULE: Record<RecapCardProps["tone"], string> = {
  brand: "from-brand-400 to-brand-600",
  mint: "from-mint/60 to-mint",
};

const TONE_LABEL: Record<RecapCardProps["tone"], string> = {
  brand: "text-primary",
  mint: "text-mint",
};

/** Shared frame for a recap result: coloured spine, label row, hide button. */
export function RecapCard({
  id,
  label,
  tone,
  actions,
  onHide,
  children,
}: RecapCardProps): React.JSX.Element {
  return (
    <div
      id={id}
      className="animate-pop relative overflow-hidden rounded-3xl border border-border bg-card p-5 pl-7 shadow-soft sm:p-6 sm:pl-8"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-5 left-0 w-1.5 rounded-r-full bg-gradient-to-b",
          TONE_RULE[tone],
        )}
      />

      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "text-[0.7rem] font-extrabold uppercase tracking-[0.18em]",
            TONE_LABEL[tone],
          )}
        >
          {label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={onHide}
            aria-label={`Hide ${label.toLowerCase()}`}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

export function RecapError({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}): React.JSX.Element {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3">
      <p className="flex-1 text-sm font-semibold text-destructive">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}

export function RecapSkeletonLines({
  widths,
}: {
  readonly widths: readonly string[];
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {widths.map((width, i) => (
        <span
          key={i}
          className="h-3.5 animate-pulse rounded-full bg-secondary"
          style={{ width, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}
