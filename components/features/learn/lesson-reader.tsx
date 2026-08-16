import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonContent } from "./lesson-content";
import { LessonCompletionBar } from "./lesson-completion-bar";
import { LessonSpine, lessonHref } from "./lesson-spine";
import { ProgressDial } from "./progress-dial";
import type {
  CompletionState,
  LearnerCourse,
  LessonSpineItem,
  ReadableLesson,
} from "@/app/types/learn";

interface LessonReaderProps {
  readonly course: LearnerCourse;
  readonly lesson: ReadableLesson;
  readonly spine: readonly LessonSpineItem[];
}

function completionStateOf(
  lesson: ReadableLesson,
  isEnrolled: boolean,
): CompletionState {
  if (lesson.isCompleted) return { kind: "completed" };
  if (!isEnrolled) return { kind: "needs-enrollment" };
  return { kind: "ready" };
}

export function LessonReader({
  course,
  lesson,
  spine,
}: LessonReaderProps): React.JSX.Element {
  const completedCount = spine.filter((item) => item.isCompleted).length;
  const hasPrev = lesson.position > 1;
  const hasNext = lesson.position < spine.length;
  const nextHref = hasNext
    ? lessonHref(course.id, lesson.position + 1)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb back to the syllabus */}
      <Link
        href={`/dashboard/courses/${course.id}`}
        className="group inline-flex w-fit items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="line-clamp-1">{course.title}</span>
      </Link>

      {/* Compact progress strip — replaces the spine on narrow screens */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700 ease-out"
            style={{
              width: `${spine.length > 0 ? (completedCount / spine.length) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
          {completedCount}/{spine.length}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <article className="animate-pop flex min-w-0 flex-col gap-6">
          <header>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              <ListChecks className="h-3.5 w-3.5 text-primary" />
              Lesson {lesson.position} of {spine.length}
            </span>
            <h1 className="mt-3 break-words font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {lesson.title}
            </h1>
          </header>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <LessonContent html={lesson.html} />
          </div>

          <LessonCompletionBar
            courseId={course.id}
            lessonId={lesson.id}
            state={completionStateOf(lesson, course.isEnrolled)}
            nextHref={nextHref}
          />

          {/* Sequential navigation */}
          <nav className="flex items-center justify-between gap-3 border-t border-border pt-5">
            <StepLink
              href={hasPrev ? lessonHref(course.id, lesson.position - 1) : null}
              direction="prev"
            />
            <StepLink href={nextHref} direction="next" />
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <ProgressDial
                completed={completedCount}
                total={spine.length}
                className="h-14 w-14 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-display text-sm font-extrabold leading-tight">
                  Course progress
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {completedCount} of {spine.length} lessons
                </p>
              </div>
            </div>

            <div className="max-h-[calc(100svh-16rem)] overflow-y-auto border-t border-border pt-4">
              <LessonSpine
                courseId={course.id}
                lessons={spine}
                currentPosition={lesson.position}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepLink({
  href,
  direction,
}: {
  readonly href: string | null;
  readonly direction: "prev" | "next";
}): React.JSX.Element {
  const label = direction === "prev" ? "Previous" : "Next";
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;

  if (href === null) {
    return <span aria-hidden className="h-9" />;
  }

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary",
        direction === "next" && "ml-auto",
      )}
    >
      {direction === "prev" && (
        <Icon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      )}
      {label}
      {direction === "next" && (
        <Icon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
