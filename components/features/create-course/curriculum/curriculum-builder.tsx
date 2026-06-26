"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Plus, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseType } from "@/app/types/course";
import { LessonEditor } from "./lesson-editor";
import { LessonSidebar } from "./lesson-sidebar";
import type { LessonDraft } from "./types";

interface CurriculumBuilderProps {
  readonly course: CourseType;
  readonly initialLessons?: readonly LessonDraft[];
}

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "error"; message: string };

function createLesson(): LessonDraft {
  return { id: crypto.randomUUID(), title: "", content: "" };
}

function reorderList<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function CurriculumBuilder({
  course,
  initialLessons = [],
}: CurriculumBuilderProps): React.JSX.Element {
  const [lessons, setLessons] = useState<readonly LessonDraft[]>(initialLessons);
  const [activeId, setActiveId] = useState<string | null>(
    initialLessons[0]?.id ?? null,
  );
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  const markDirty = useCallback((): void => {
    setSaveState((prev) =>
      prev.status === "saving" ? prev : { status: "idle" },
    );
  }, []);

  const addLesson = useCallback((): void => {
    const lesson = createLesson();
    setLessons((prev) => [...prev, lesson]);
    setActiveId(lesson.id);
    markDirty();
  }, [markDirty]);

  const deleteLesson = useCallback(
    (id: string): void => {
      setLessons((prev) => {
        const index = prev.findIndex((l) => l.id === id);
        const next = prev.filter((l) => l.id !== id);
        setActiveId((current) => {
          if (current !== id) return current;
          const fallback = next[index] ?? next[index - 1] ?? next[0];
          return fallback?.id ?? null;
        });
        return next;
      });
      markDirty();
    },
    [markDirty],
  );

  const updateActive = useCallback(
    (patch: Partial<Omit<LessonDraft, "id">>): void => {
      setLessons((prev) =>
        prev.map((l) => (l.id === activeId ? { ...l, ...patch } : l)),
      );
      markDirty();
    },
    [activeId, markDirty],
  );

  const reorder = useCallback(
    (from: number, to: number): void => {
      setLessons((prev) => reorderList(prev, from, to));
      markDirty();
    },
    [markDirty],
  );

  const goRelative = useCallback(
    (delta: number): void => {
      setActiveId((current) => {
        const index = lessons.findIndex((l) => l.id === current);
        const next = lessons[index + delta];
        return next ? next.id : current;
      });
    },
    [lessons],
  );


  const persistDraft = useCallback(async (): Promise<void> => {
    setSaveState({ status: "saving" });
    // TODO: await saveCurriculumDraft(course.id, lessons)
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaveState({ status: "saved" });
  }, []);

  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const activeLesson = activeIndex >= 0 ? lessons[activeIndex] : null;
  const isSaving = saveState.status === "saving";

  return (
    <div className="flex flex-col gap-5">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate font-semibold text-foreground">
            {course.title}
          </span>
          <span aria-hidden>·</span>
          <span>
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SaveStatus state={saveState} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={persistDraft}
            disabled={isSaving || lessons.length === 0}
            className="rounded-full"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save draft
          </Button>
        </div>
      </div>

      {/* Two-pane builder */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <LessonSidebar
          lessons={lessons}
          activeId={activeId}
          onSelect={setActiveId}
          onAdd={addLesson}
          onDelete={deleteLesson}
          onReorder={reorder}
        />

        {activeLesson ? (
          <LessonEditor
            lesson={activeLesson}
            index={activeIndex}
            total={lessons.length}
            onTitleChange={(title) => updateActive({ title })}
            onContentChange={(content) => updateActive({ content })}
            onPrev={() => goRelative(-1)}
            onNext={() => goRelative(1)}
          />
        ) : (
          <EmptyState onAdd={addLesson} />
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }): React.JSX.Element | null {
  if (state.status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-mint">
        <Check className="h-3.5 w-3.5" />
        Draft saved
      </span>
    );
  }
  if (state.status === "error") {
    return (
      <span className="text-xs font-bold text-destructive">{state.message}</span>
    );
  }
  return null;
}

function EmptyState({ onAdd }: { onAdd: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </span>
      <div>
        <h3 className="font-display text-xl font-extrabold">
          A blank canvas awaits
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Build your course one lesson at a time. Add a lesson, write with the
          rich editor, and reorder them whenever inspiration strikes.
        </p>
      </div>
      <Button
        type="button"
        onClick={onAdd}
        className="group rounded-full px-6 shadow-glow"
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Add your first lesson
      </Button>
    </div>
  );
}
