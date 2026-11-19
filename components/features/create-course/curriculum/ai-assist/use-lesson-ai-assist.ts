"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EditorRange,
  EditorSelectionSnapshot,
} from "@/components/ui/rich-text-editor-insert";
import { lessonAiService } from "./lesson-ai-service";
import type { AiHelpEntry } from "./types";

const NO_ENTRIES: readonly AiHelpEntry[] = [];

interface UseLessonAiAssistArgs {
  readonly lessonId: string;
  readonly lessonTitle: string;
}

export interface LessonAiAssist {
  readonly isOpen: boolean;
  readonly pendingSelection: string;
  readonly entries: readonly AiHelpEntry[];
  readonly isBusy: boolean;
  /** Open the panel seeded with the text the author highlighted. */
  readonly openWithSelection: (selection: EditorSelectionSnapshot) => void;
  /** Open the panel for a general question (no highlight). */
  readonly open: () => void;
  readonly close: () => void;
  readonly clearSelection: () => void;
  readonly submit: (prompt: string) => void;
}

export function useLessonAiAssist({
  lessonId,
  lessonTitle,
}: UseLessonAiAssistArgs): LessonAiAssist {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState("");
  const [pendingRange, setPendingRange] = useState<EditorRange | null>(null);
  const [entriesByLesson, setEntriesByLesson] = useState<
    Record<string, readonly AiHelpEntry[]>
  >({});

  // The panel is per-lesson: when the author switches lessons, drop the staged
  // selection but keep each lesson's history so they can flip back to it.
  useEffect(() => {
    setPendingSelection("");
    setPendingRange(null);
  }, [lessonId]);

  const lessonTitleRef = useRef(lessonTitle);
  useEffect(() => {
    lessonTitleRef.current = lessonTitle;
  }, [lessonTitle]);

  const entries = entriesByLesson[lessonId] ?? NO_ENTRIES;
  const isBusy = entries.some((entry) => entry.status === "pending");

  const openWithSelection = useCallback((selection: EditorSelectionSnapshot): void => {
    setPendingSelection(selection.text);
    setPendingRange(selection.range);
    setIsOpen(true);
  }, []);

  const open = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const clearSelection = useCallback((): void => {
    setPendingSelection("");
    setPendingRange(null);
  }, []);

  const patchEntry = useCallback(
    (lesson: string, id: string, patch: Partial<AiHelpEntry>): void => {
      setEntriesByLesson((prev) => {
        const list = prev[lesson] ?? NO_ENTRIES;
        return {
          ...prev,
          [lesson]: list.map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry,
          ),
        };
      });
    },
    [],
  );

  const submit = useCallback(
    (prompt: string): void => {
      const trimmed = prompt.trim();
      if (trimmed.length === 0) return;

      const id = crypto.randomUUID();
      const selection = pendingSelection;
      const targetLesson = lessonId;
      const entry: AiHelpEntry = {
        id,
        lessonId: targetLesson,
        selection,
        range: selection.length > 0 ? pendingRange : null,
        prompt: trimmed,
        createdAt: Date.now(),
        status: "pending",
        answer: "",
        error: null,
      };

      setEntriesByLesson((prev) => ({
        ...prev,
        [targetLesson]: [...(prev[targetLesson] ?? NO_ENTRIES), entry],
      }));

      void lessonAiService
        .requestHelp({
          selection,
          prompt: trimmed,
          lessonTitle: lessonTitleRef.current,
        })
        .then((result) => {
          if (result.success) {
            patchEntry(targetLesson, id, {
              status: "done",
              answer: result.data,
            });
          } else {
            patchEntry(targetLesson, id, {
              status: "error",
              error: result.error,
            });
          }
        })
        .catch((cause: unknown) => {
          patchEntry(targetLesson, id, {
            status: "error",
            error:
              cause instanceof Error ? cause.message : "The assistant did not respond.",
          });
        });
    },
    [lessonId, patchEntry, pendingSelection, pendingRange],
  );

  return useMemo(
    () => ({
      isOpen,
      pendingSelection,
      entries,
      isBusy,
      openWithSelection,
      open,
      close,
      clearSelection,
      submit,
    }),
    [
      isOpen,
      pendingSelection,
      entries,
      isBusy,
      openWithSelection,
      open,
      close,
      clearSelection,
      submit,
    ],
  );
}
