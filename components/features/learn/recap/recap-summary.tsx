"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { RecapCard, RecapError, RecapSkeletonLines } from "./recap-card";
import type { RecapRequestState } from "./types";

const COPIED_RESET_MS = 1600;
const SKELETON_WIDTHS = ["100%", "96%", "88%", "93%", "70%"] as const;

interface RecapSummaryProps {
  readonly id: string;
  readonly state: RecapRequestState<string>;
  readonly onRetry: () => void;
  readonly onHide: () => void;
}

export function RecapSummary({
  id,
  state,
  onRetry,
  onHide,
}: RecapSummaryProps): React.JSX.Element | null {
  if (state.status === "idle") return null;

  return (
    <RecapCard
      id={id}
      label="Summary"
      tone="brand"
      onHide={onHide}
      actions={state.status === "done" ? <CopyButton text={state.data} /> : null}
    >
      <div aria-live="polite" aria-busy={state.status === "loading"}>
        {state.status === "loading" && (
          <>
            <span className="sr-only">Summarizing the lesson…</span>
            <RecapSkeletonLines widths={SKELETON_WIDTHS} />
          </>
        )}
        {state.status === "error" && (
          <RecapError message={state.error} onRetry={onRetry} />
        )}
        {state.status === "done" && (
          <p className="text-[0.95rem] leading-relaxed text-foreground/90 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[2.6rem] first-letter:font-extrabold first-letter:leading-[0.85] first-letter:text-primary">
            {state.data}
          </p>
        )}
      </div>
    </RecapCard>
  );
}

function CopyButton({ text }: { readonly text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  function copy(): void {
    navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy summary"}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-mint" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
