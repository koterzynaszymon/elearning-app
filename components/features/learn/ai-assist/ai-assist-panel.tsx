"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Copy,
  CornerDownLeft,
  Quote,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAssistDrawerLayout } from "@/components/shared/use-assist-drawer-layout";
import { cn } from "@/lib/utils";
import { AI_HELP_PRESETS } from "./presets";
import type { AiHelpEntry } from "./types";

const PROMPT_MAX = 500;

interface AiAssistPanelProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly pendingSelection: string;
  readonly onClearSelection: () => void;
  readonly entries: readonly AiHelpEntry[];
  readonly isBusy: boolean;
  readonly onSubmit: (prompt: string) => void;
}

export function AiAssistPanel({
  open,
  onClose,
  pendingSelection,
  onClearSelection,
  entries,
  isBusy,
  onSubmit,
}: AiAssistPanelProps): React.ReactPortal | null {
  const [prompt, setPrompt] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useAssistDrawerLayout();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries]);

  function handleSubmit(): void {
    const trimmed = prompt.trim();
    if (trimmed.length === 0 || isBusy) return;
    onSubmit(trimmed);
    setPrompt("");
  }

  if (!mounted) return null;

  return createPortal(
    <div
      data-ai-assist-panel
      data-open={open}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <aside
        aria-hidden={!open}
        className={cn(
          "pointer-events-auto absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col border-l border-border bg-card shadow-soft transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-extrabold leading-tight">
              Study assistant
            </h2>
            <p className="text-xs text-muted-foreground">
              Highlight text, ask, keep learning
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close assistant"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {entries.length === 0 ? (
          <EmptyConversation />
        ) : (
          entries.map((entry, index) => (
            <ConversationEntry
              key={entry.id}
              entry={entry}
              isLatest={index === entries.length - 1}
            />
          ))
        )}
      </div>

      <div className="border-t border-border bg-card px-5 py-4">
        {pendingSelection ? (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/[0.06] px-3 py-2">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="line-clamp-3 flex-1 text-xs italic text-foreground/80">
              {pendingSelection}
            </p>
            <button
              type="button"
              onClick={onClearSelection}
              aria-label="Remove highlighted text"
              className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="mb-3 text-xs text-muted-foreground">
            No text highlighted — ask a general question about this lesson.
          </p>
        )}

        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {AI_HELP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPrompt(preset.prompt)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, PROMPT_MAX))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={3}
            placeholder="e.g. Explain the second paragraph with a simple example."
            className="resize-none rounded-xl pr-3 text-sm"
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {isBusy ? "Assistant is working…" : "⌘/Ctrl + Enter to send"}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={prompt.trim().length === 0 || isBusy}
            className="rounded-full"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
            Ask
          </Button>
        </div>
      </div>
    </aside>
    </div>,
    document.body,
  );
}

function EmptyConversation(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-background/60 px-5 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-foreground">Nothing asked yet</p>
      <p className="max-w-[15rem] text-xs text-muted-foreground">
        Select a sentence in the lesson and tap <strong>Explain</strong>, or
        type a question below. Answers stay here while you keep reading.
      </p>
    </div>
  );
}

interface ConversationEntryProps {
  readonly entry: AiHelpEntry;
  readonly isLatest: boolean;
}

function ConversationEntry({ entry, isLatest }: ConversationEntryProps): React.JSX.Element {
  return (
    <article className="animate-pop space-y-2">
      {entry.selection ? (
        <blockquote className="border-l-2 border-primary/40 pl-3 text-xs italic text-muted-foreground">
          {entry.selection}
        </blockquote>
      ) : null}

      <p className="rounded-xl rounded-br-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground">
        {entry.prompt}
      </p>

      {entry.status === "pending" ? (
        <ThinkingIndicator />
      ) : entry.status === "error" ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
          {entry.error}
        </p>
      ) : (
        <AnswerCard text={entry.answer} animate={isLatest} />
      )}
    </article>
  );
}

function ThinkingIndicator(): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-accent/60 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">Thinking…</span>
    </div>
  );
}

interface AnswerCardProps {
  readonly text: string;
  readonly animate: boolean;
}

function AnswerCard({ text, animate }: AnswerCardProps): React.JSX.Element {
  const shown = useStreamedText(text, animate);
  const [copied, setCopied] = useState(false);
  const tailRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (animate) tailRef.current?.scrollIntoView({ block: "nearest" });
  }, [shown, animate]);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl rounded-bl-sm border border-border bg-background px-3.5 py-3">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {shown}
        <span ref={tailRef} aria-hidden />
      </p>
      <div className="mt-2.5 flex justify-end border-t border-border/70 pt-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-mint" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/** Reveals text a few characters at a time for a streamed feel */
function useStreamedText(text: string, enabled: boolean): string {
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    let cursor = 0;
    setShown("");
    const id = window.setInterval(() => {
      cursor = Math.min(cursor + 3, text.length);
      setShown(text.slice(0, cursor));
      if (cursor >= text.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [text, enabled]);

  return shown;
}
