"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { markLessonCompleted } from "@/lib/data-access/lesson-completions";
import { enrollInCourse } from "@/lib/data-access/enrollments";
import { cn } from "@/lib/utils";
import type { CompletionState } from "@/app/types/learn";
import type { Result } from "@/app/types/profile";

interface LessonCompletionBarProps {
  readonly courseId: string;
  readonly lessonId: string;
  readonly state: CompletionState;
  readonly nextHref: string | null;
}

const SHELL =
  "sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-3xl border p-4 shadow-soft backdrop-blur";

export function LessonCompletionBar({
  courseId,
  lessonId,
  state,
  nextHref,
}: LessonCompletionBarProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<Result<unknown>>): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  if (state.kind === "completed") {
    return (
      <div className={cn(SHELL, "border-mint/40 bg-mint/10")}>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-mint">
          <CheckCircle2 className="h-5 w-5" />
          Lesson complete
        </span>
        <NextAction nextHref={nextHref} courseId={courseId} />
      </div>
    );
  }

  if (state.kind === "needs-enrollment") {
    return (
      <div className={cn(SHELL, "flex-col items-start border-border bg-card/85 sm:flex-row sm:items-center")}>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Join to track your progress</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            You can read this course freely — enroll to keep a record of what
            you&apos;ve finished.
          </p>
          {error !== null && <ErrorNote message={error} />}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => enrollInCourse(courseId))}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Join course
        </button>
      </div>
    );
  }

  return (
    <div className={cn(SHELL, "border-border bg-card/85")}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Finished reading?</p>
        {error !== null ? (
          <ErrorNote message={error} />
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mark this lesson complete to move your progress forward.
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => markLessonCompleted(lessonId))}
        className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Lesson completed
      </button>
    </div>
  );
}

function NextAction({
  nextHref,
  courseId,
}: {
  readonly nextHref: string | null;
  readonly courseId: string;
}): React.JSX.Element {
  const href = nextHref ?? `/dashboard/courses/${courseId}`;
  const label = nextHref === null ? "Back to course" : "Next lesson";

  return (
    <Link
      href={href}
      className="group ml-auto inline-flex items-center gap-2 rounded-full border border-mint/40 bg-background/60 px-5 py-2.5 text-sm font-bold text-mint transition-all hover:bg-background"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function ErrorNote({ message }: { readonly message: string }): React.JSX.Element {
  return (
    <p role="alert" className="mt-0.5 text-xs font-semibold text-destructive">
      {message}
    </p>
  );
}
