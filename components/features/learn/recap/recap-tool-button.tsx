"use client";

import { ArrowRight, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecapRequestState } from "./types";

interface RecapToolButtonProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly meta: string;
  readonly tone: "brand" | "mint";
  readonly state: RecapRequestState<unknown>;
  readonly isOpen: boolean;
  readonly controls: string;
  readonly onClick: () => void;
}

const TONE_ICON: Record<RecapToolButtonProps["tone"], string> = {
  brand: "bg-gradient-to-br from-brand-400 to-brand-600 text-white",
  mint: "bg-mint/15 text-mint",
};

function statusLabel(state: RecapRequestState<unknown>, isOpen: boolean): string {
  switch (state.status) {
    case "idle":
      return "Generate";
    case "loading":
      return "Working…";
    case "error":
      return "Try again";
    case "done":
      return isOpen ? "Hide" : "Show";
  }
}

export function RecapToolButton({
  icon: Icon,
  title,
  meta,
  tone,
  state,
  isOpen,
  controls,
  onClick,
}: RecapToolButtonProps): React.JSX.Element {
  const isDone = state.status === "done";
  const isLoading = state.status === "loading";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-expanded={isDone || isLoading ? isOpen : undefined}
      aria-controls={controls}
      className={cn(
        "group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border bg-card p-3.5 pr-4 text-left shadow-soft transition-all",
        "hover:-translate-y-0.5 hover:border-primary/40 disabled:cursor-wait disabled:hover:translate-y-0",
        isOpen && (isDone || isLoading) ? "border-primary/40" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:-rotate-6",
          TONE_ICON[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-[0.95rem] font-extrabold leading-tight">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{meta}</span>
      </span>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors",
          state.status === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground",
        )}
      >
        {statusLabel(state, isOpen)}
        <StatusIcon state={state} isOpen={isOpen} />
      </span>
    </button>
  );
}

function StatusIcon({
  state,
  isOpen,
}: {
  readonly state: RecapRequestState<unknown>;
  readonly isOpen: boolean;
}): React.JSX.Element {
  if (state.status === "loading") {
    return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  }
  if (state.status === "error") {
    return <RotateCcw className="h-3.5 w-3.5" />;
  }
  if (state.status === "done") {
    return (
      <ChevronDown
        className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
      />
    );
  }
  return (
    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
  );
}
