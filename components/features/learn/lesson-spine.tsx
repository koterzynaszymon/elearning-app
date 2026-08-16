import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonSpineItem } from "@/app/types/learn";

interface LessonSpineProps {
  readonly courseId: string;
  readonly lessons: readonly LessonSpineItem[];
  readonly currentPosition: number | null;
}

export function lessonHref(courseId: string, position: number): string {
  return `/dashboard/courses/${courseId}/lessons/${position}`;
}

export function LessonSpine({
  courseId,
  lessons,
  currentPosition,
}: LessonSpineProps): React.JSX.Element {
  return (
    <ol className="flex flex-col">
      {lessons.map((lesson, index) => {
        const isCurrent = lesson.position === currentPosition;
        const isLast = index === lessons.length - 1;

        return (
          <li key={lesson.id} className="flex gap-3">
            {/* Rail: node plus the connector that fills as lessons are finished */}
            <span
              aria-hidden
              className="flex w-6 shrink-0 flex-col items-center pt-1"
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-extrabold tabular-nums transition-colors",
                  lesson.isCompleted &&
                    "border-mint bg-mint text-primary-foreground",
                  !lesson.isCompleted &&
                    isCurrent &&
                    "border-primary bg-primary text-primary-foreground shadow-glow",
                  !lesson.isCompleted &&
                    !isCurrent &&
                    "border-border bg-card text-muted-foreground",
                )}
              >
                {lesson.isCompleted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  lesson.position
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1 rounded-full",
                    lesson.isCompleted ? "bg-mint/50" : "bg-border",
                  )}
                />
              )}
            </span>

            <Link
              href={lessonHref(courseId, lesson.position)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "-mt-0.5 mb-1.5 min-w-0 flex-1 rounded-xl px-2.5 py-1.5 text-sm transition-colors",
                isCurrent
                  ? "bg-secondary/70 font-bold text-foreground"
                  : "font-semibold text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
              )}
            >
              <span className="line-clamp-2 break-words leading-snug">
                {lesson.title}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
