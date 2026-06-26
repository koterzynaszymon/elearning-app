"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import type { LessonDraft } from "./types";

const TITLE_MAX = 100;

interface LessonEditorProps {
  readonly lesson: LessonDraft;
  readonly index: number;
  readonly total: number;
  readonly onTitleChange: (title: string) => void;
  readonly onContentChange: (html: string) => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

export function LessonEditor({
  lesson,
  index,
  total,
  onTitleChange,
  onContentChange,
  onPrev,
  onNext,
}: LessonEditorProps): React.JSX.Element {
  const canPrev = index > 0;
  const canNext = index < total - 1;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          Lesson {index + 1} of {total}
        </span>
        <div className="flex items-center gap-1.5">
          <NavButton
            onClick={onPrev}
            disabled={!canPrev}
            label="Previous lesson"
            icon={ChevronLeft}
          />
          <NavButton
            onClick={onNext}
            disabled={!canNext}
            label="Next lesson"
            icon={ChevronRight}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          value={lesson.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="Lesson title — e.g. Getting set up"
          autoComplete="off"
          className="h-12 rounded-xl border-transparent bg-card px-4 font-display text-xl font-extrabold shadow-soft focus-visible:border-input"
        />
      </div>

      <RichTextEditor
        key={lesson.id}
        content={lesson.content}
        onChange={onContentChange}
        placeholder="Write the lesson here. Use the toolbar for headings, lists, quotes and more…"
        className="min-h-[28rem] shadow-soft"
      />
    </section>
  );
}

interface NavButtonProps {
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

function NavButton({
  onClick,
  disabled,
  label,
  icon: Icon,
}: NavButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors",
        "hover:border-primary/40 hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
