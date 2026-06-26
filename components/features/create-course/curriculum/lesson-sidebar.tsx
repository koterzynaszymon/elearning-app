"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonDraft } from "./types";

interface LessonSidebarProps {
  readonly lessons: readonly LessonDraft[];
  readonly activeId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onAdd: () => void;
  readonly onDelete: (id: string) => void;
  readonly onReorder: (fromIndex: number, toIndex: number) => void;
}

function lessonLabel(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : "Untitled lesson";
}

export function LessonSidebar({
  lessons,
  activeId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: LessonSidebarProps): React.JSX.Element {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDrop = (toIndex: number): void => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <aside className="flex flex-col rounded-3xl border border-border bg-card shadow-soft lg:sticky lg:top-10 lg:self-start lg:max-h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-extrabold leading-tight">
            Lessons
          </h2>
          <p className="text-xs text-muted-foreground">
            {lessons.length === 0
              ? "None yet"
              : `${lessons.length} lesson${lessons.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {lessons.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs leading-relaxed text-muted-foreground">
            Add your first lesson to start shaping the curriculum.
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {lessons.map((lesson, index) => {
              const active = lesson.id === activeId;
              const isOver = overIndex === index && dragIndex !== index;
              return (
                <li
                  key={lesson.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnter={() => setOverIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={cn(
                    "group flex items-center gap-1 rounded-2xl border-2 px-1 transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-secondary/60",
                    isOver && "border-dashed border-primary/60",
                    dragIndex === index && "opacity-50",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground/50 transition-colors group-hover:text-muted-foreground active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelect(lesson.id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "truncate text-sm font-semibold",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {lessonLabel(lesson.title)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(lesson.id)}
                    aria-label={`Delete ${lessonLabel(lesson.title)}`}
                    className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/0 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:text-muted-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onAdd}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Add lesson
        </button>
      </div>
    </aside>
  );
}
