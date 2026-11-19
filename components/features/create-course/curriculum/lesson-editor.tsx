"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type {
  InsertMode,
  InsertOutcome,
  InsertTarget,
  RichTextEditorHandle,
} from "@/components/ui/rich-text-editor-insert";
import { cn } from "@/lib/utils";
import { AiAssistPanel } from "./ai-assist/ai-assist-panel";
import { useLessonAiAssist } from "./ai-assist/use-lesson-ai-assist";
import type { AiHelpEntry } from "./ai-assist/types";
import type { LessonDraft } from "./types";

function insertTargetFor(entry: AiHelpEntry, mode: InsertMode): InsertTarget {
  if (mode === "cursor" || entry.range === null) return { mode: "cursor" };
  return { mode, range: entry.range, expectedText: entry.selection };
}

const TITLE_MAX = 100;

interface LessonEditorProps {
  readonly lesson: LessonDraft;
  readonly index: number;
  readonly total: number;
  readonly onTitleChange: (title: string) => void;
  readonly onContentChange: (html: string) => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  /** Rendered under the editor — the lesson's file attachments. */
  readonly attachments?: React.ReactNode;
}

export function LessonEditor({
  lesson,
  index,
  total,
  onTitleChange,
  onContentChange,
  onPrev,
  onNext,
  attachments,
}: LessonEditorProps): React.JSX.Element {
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const assist = useLessonAiAssist({
    lessonId: lesson.id,
    lessonTitle: lesson.title,
  });

  const editorRef = useRef<RichTextEditorHandle>(null);
  const insertAnswer = useCallback(
    (entry: AiHelpEntry, mode: InsertMode): InsertOutcome =>
      editorRef.current?.insertText(entry.answer, insertTargetFor(entry, mode)) ?? "empty",
    [],
  );

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          Lesson {index + 1} of {total}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={assist.isOpen ? assist.close : assist.open}
            aria-pressed={assist.isOpen}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors",
              assist.isOpen
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Assistant
          </button>
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
        // Prefixed: `attachments` is rendered beside this and is keyed by the
        // lesson id too. Sibling keys must differ or React loses track of one
        // and leaves the old editor in the DOM on every lesson switch.
        key={`editor-${lesson.id}`}
        ref={editorRef}
        content={lesson.content}
        onChange={onContentChange}
        onAiAssist={assist.openWithSelection}
        placeholder="Write the lesson here. Use the toolbar for headings, lists, quotes and more…"
        className="min-h-[28rem] shadow-soft"
      />

      {attachments}

      <AiAssistPanel
        open={assist.isOpen}
        onClose={assist.close}
        pendingSelection={assist.pendingSelection}
        onClearSelection={assist.clearSelection}
        entries={assist.entries}
        isBusy={assist.isBusy}
        onSubmit={assist.submit}
        onInsertAnswer={insertAnswer}
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
