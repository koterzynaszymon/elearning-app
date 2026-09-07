"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UserRound, Users } from "lucide-react";
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
import { removeStudentFromCourse } from "@/lib/data-access/roster";
import type { CourseRosterEntry } from "@/app/types/author";

interface StudentRosterProps {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly students: readonly CourseRosterEntry[];
}

function formatEnrolledAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentRoster({
  courseId,
  courseTitle,
  students,
}: StudentRosterProps): React.JSX.Element {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">
            No one&apos;s enrolled yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            When learners join{" "}
            <span className="font-semibold text-foreground">{courseTitle}</span>,
            you&apos;ll be able to manage their access here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {students.map((student) => (
        <StudentRow
          key={student.userId}
          courseId={courseId}
          student={student}
        />
      ))}
    </ul>
  );
}

interface StudentRowProps {
  readonly courseId: string;
  readonly student: CourseRosterEntry;
}

function StudentRow({ courseId, student }: StudentRowProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleConfirm = (): void => {
    setError(null);
    startTransition(async () => {
      const result = await removeStudentFromCourse(courseId, student.userId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserRound className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-extrabold leading-tight">
          {student.displayName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {student.email ?? student.username ?? "No contact details"}
          <span aria-hidden> · </span>
          Joined {formatEnrolledAt(student.enrolledAt)}
        </p>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {student.displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll lose access to this course&apos;s lessons right away.
              Their completed-lesson history is kept, so their progress returns
              if they enrol again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error !== null && (
            <p className="text-sm font-semibold text-destructive">{error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing…
                </>
              ) : (
                "Remove learner"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
