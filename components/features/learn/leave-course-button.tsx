"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
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
import { unenrollFromCourse } from "@/lib/data-access/enrollments";

interface LeaveCourseButtonProps {
  readonly courseId: string;
  readonly courseTitle: string;
}

export function LeaveCourseButton({
  courseId,
  courseTitle,
}: LeaveCourseButtonProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleConfirm = (): void => {
    setError(null);
    startTransition(async () => {
      const result = await unenrollFromCourse(courseId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push("/dashboard/courses");
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Leave course
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave &ldquo;{courseTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll lose access to this course&apos;s lessons until you
            enrol again. Your completed-lesson history is kept, so your
            progress will still be there if you come back.
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
                Leaving…
              </>
            ) : (
              "Leave course"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
