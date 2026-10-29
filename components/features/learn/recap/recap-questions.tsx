"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecapCard, RecapError, RecapSkeletonLines } from "./recap-card";
import type { RecapQuestion, RecapRequestState } from "./types";

const SKELETON_CARDS = 3;
const SKELETON_WIDTHS = ["85%", "55%"] as const;

interface RecapQuestionsProps {
  readonly id: string;
  readonly state: RecapRequestState<readonly RecapQuestion[]>;
  readonly onRetry: () => void;
  readonly onHide: () => void;
}

export function RecapQuestions({
  id,
  state,
  onRetry,
  onHide,
}: RecapQuestionsProps): React.JSX.Element | null {
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  if (state.status === "idle") return null;

  const allRevealed =
    state.status === "done" && state.data.every((q) => revealed.has(q.id));

  function toggle(questionId: string): void {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function toggleAll(questions: readonly RecapQuestion[]): void {
    setRevealed(allRevealed ? new Set() : new Set(questions.map((q) => q.id)));
  }

  return (
    <RecapCard
      id={id}
      label="Check yourself"
      tone="mint"
      onHide={onHide}
      actions={
        state.status === "done" ? (
          <button
            type="button"
            onClick={() => toggleAll(state.data)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {allRevealed ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {allRevealed ? "Hide all" : "Reveal all"}
          </button>
        ) : null
      }
    >
      <div aria-live="polite" aria-busy={state.status === "loading"}>
        {state.status === "loading" && <QuestionsSkeleton />}
        {state.status === "error" && (
          <RecapError message={state.error} onRetry={onRetry} />
        )}
        {state.status === "done" && (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              Answer in your head first, then reveal to check.
            </p>
            <ol className="flex flex-col gap-3">
              {state.data.map((q, i) => (
                <Flashcard
                  key={q.id}
                  index={i}
                  question={q}
                  isRevealed={revealed.has(q.id)}
                  onToggle={() => toggle(q.id)}
                />
              ))}
            </ol>
          </>
        )}
      </div>
    </RecapCard>
  );
}

interface FlashcardProps {
  readonly index: number;
  readonly question: RecapQuestion;
  readonly isRevealed: boolean;
  readonly onToggle: () => void;
}

function Flashcard({
  index,
  question,
  isRevealed,
  onToggle,
}: FlashcardProps): React.JSX.Element {
  const answerId = `recap-answer-${question.id}`;

  return (
    <li
      className="animate-pop grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-2xl bg-secondary/50 p-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        aria-hidden
        className="font-display text-3xl font-extrabold leading-none tabular-nums text-mint/70"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <p className="font-bold leading-snug">{question.question}</p>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isRevealed}
          aria-controls={answerId}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-mint/40 bg-background/70 px-3 py-1 text-xs font-bold text-mint transition-colors hover:bg-background"
        >
          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {isRevealed ? "Hide answer" : "Reveal answer"}
        </button>

        {/* grid-rows 0fr → 1fr animates height without measuring */}
        <div
          id={answerId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            isRevealed ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden" inert={!isRevealed}>
            <p className="mt-3 border-l-2 border-mint pl-3 text-sm leading-relaxed text-foreground/85">
              {question.answer}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

function QuestionsSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <span className="sr-only">Writing review questions…</span>
      {Array.from({ length: SKELETON_CARDS }, (_, i) => (
        <div key={i} className="flex gap-4 rounded-2xl bg-secondary/50 p-4">
          <span className="h-7 w-8 animate-pulse rounded-lg bg-secondary" />
          <div className="flex-1">
            <RecapSkeletonLines widths={SKELETON_WIDTHS} />
          </div>
        </div>
      ))}
    </div>
  );
}
