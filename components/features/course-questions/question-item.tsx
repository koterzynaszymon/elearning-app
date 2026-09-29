"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Trash2, UserRound } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  answerCourseQuestion,
  deleteCourseQuestion,
} from "@/lib/data-access/course-questions";
import type { CourseQuestion } from "@/app/types/course-questions";

interface QuestionItemProps {
  readonly question: CourseQuestion;
  readonly canAnswer: boolean;
  readonly canDelete: boolean;
}

const ANSWER_MAX = 2000;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function QuestionItem({
  question,
  canAnswer,
  canDelete,
}: QuestionItemProps): React.JSX.Element {
  const router = useRouter();

  const [isAnswering, setIsAnswering] = useState(false);
  const [answerDraft, setAnswerDraft] = useState(question.answer ?? "");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isAnswerPending, startAnswerTransition] = useTransition();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleAnswerSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setAnswerError(null);
    startAnswerTransition(async () => {
      const result = await answerCourseQuestion(question.id, answerDraft);
      if (!result.success) {
        setAnswerError(result.error);
        return;
      }
      setIsAnswering(false);
      router.refresh();
    });
  };

  const handleDelete = (): void => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteCourseQuestion(question.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">
            {question.askedBy.displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(question.createdAt)}
          </p>
        </div>

        {canDelete && (
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label="Delete question"
                className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the question
                  {question.answer !== null ? " and its answer" : ""} for
                  everyone. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError !== null && (
                <p className="text-sm font-semibold text-destructive">
                  {deleteError}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletePending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeletePending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletePending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {question.body}
      </p>

      {question.answer !== null && !isAnswering && (
        <div className="flex gap-3 rounded-2xl bg-secondary/60 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-mint">
              Instructor answer
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
              {question.answer}
            </p>
          </div>
        </div>
      )}

      {canAnswer && !isAnswering && (
        <button
          type="button"
          onClick={() => setIsAnswering(true)}
          className="ml-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {question.answer !== null ? "Edit answer" : "Answer"}
        </button>
      )}

      {canAnswer && isAnswering && (
        <form
          onSubmit={handleAnswerSubmit}
          className="flex flex-col gap-2 border-t border-border pt-4"
        >
          <Textarea
            value={answerDraft}
            onChange={(e) => setAnswerDraft(e.target.value)}
            placeholder="Write an answer…"
            maxLength={ANSWER_MAX}
            rows={3}
            disabled={isAnswerPending}
          />
          {answerError !== null && (
            <p className="text-sm font-semibold text-destructive">
              {answerError}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAnswering(false);
                setAnswerDraft(question.answer ?? "");
                setAnswerError(null);
              }}
              disabled={isAnswerPending}
              className="rounded-full px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnswerPending || answerDraft.trim().length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
            >
              {isAnswerPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isAnswerPending ? "Saving…" : "Save answer"}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
