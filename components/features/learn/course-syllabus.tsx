import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Globe,
  Info,
  Lock,
  MessageCircleQuestion,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { lessonHref } from "./lesson-spine";
import { ProgressDial } from "./progress-dial";
import { LeaveCourseButton } from "./leave-course-button";
import { CourseRating } from "./course-rating";
import { UnreadBadge } from "@/components/shared/unread-badge";
import type {
  CourseRatingSummary,
  LearnerCourse,
  LessonSpineItem,
} from "@/app/types/learn";

interface CourseSyllabusProps {
  readonly course: LearnerCourse;
  readonly lessons: readonly LessonSpineItem[];
  readonly ratingSummary: CourseRatingSummary;
  readonly unreadAnswers: number;
}

interface ContinueTarget {
  readonly position: number;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

function continueTarget(lessons: readonly LessonSpineItem[]): ContinueTarget {
  const nextUp = lessons.find((lesson) => !lesson.isCompleted);
  if (nextUp === undefined) {
    return { position: 1, label: "Review from the top", icon: RotateCcw };
  }
  if (nextUp.position === 1) {
    return { position: 1, label: "Start course", icon: Sparkles };
  }
  return { position: nextUp.position, label: "Continue", icon: PlayCircle };
}

export function CourseSyllabus({
  course,
  lessons,
  ratingSummary,
  unreadAnswers,
}: CourseSyllabusProps): React.JSX.Element {
  if (lessons.length === 0) {
    return <NoLessonsYet />;
  }

  const completedCount = lessons.filter((lesson) => lesson.isCompleted).length;
  const target = continueTarget(lessons);
  const CtaIcon = target.icon;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
      {/* Lesson list */}
      <ol className="animate-pop flex flex-col gap-2.5">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={lessonHref(course.id, lesson.position)}
              className={cn(
                "group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5",
                lesson.isCompleted
                  ? "border-mint/40 hover:border-mint/70"
                  : "border-border hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold tabular-nums transition-colors",
                  lesson.isCompleted
                    ? "bg-mint/15 text-mint"
                    : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                {lesson.isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  lesson.position
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 break-words font-semibold leading-snug">
                  {lesson.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs font-bold uppercase tracking-wide",
                    lesson.isCompleted ? "text-mint" : "text-muted-foreground",
                  )}
                >
                  {lesson.isCompleted ? "Completed" : `Lesson ${lesson.position}`}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        ))}
      </ol>

      {/* Sticky progress aside */}
      <aside className="animate-pop [animation-delay:60ms] lg:sticky lg:top-8 lg:self-start">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <ProgressDial
              completed={completedCount}
              total={lessons.length}
              className="h-16 w-16 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold leading-none">
                {completedCount}/{lessons.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                lessons finished
              </p>
            </div>
          </div>

          <Link
            href={lessonHref(course.id, target.position)}
            className="group flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95"
          >
            <CtaIcon className="h-4 w-4" />
            {target.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <dl className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
            <Fact
              icon={BookOpen}
              label="Lessons"
              value={String(lessons.length)}
            />
            <Fact
              icon={course.isPublic ? Globe : Lock}
              label="Visibility"
              value={course.isPublic ? "Public" : "Private"}
            />
          </dl>

          <CourseRating
            courseId={course.id}
            isEnrolled={course.isEnrolled}
            summary={ratingSummary}
          />

          <Link
            href={`/dashboard/courses/${course.id}/questions`}
            className="group flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <MessageCircleQuestion className="h-4 w-4" />
            Course Q&amp;A
            <UnreadBadge count={unreadAnswers} />
          </Link>

          {!course.isEnrolled && <NotEnrolledNote />}
          {course.isEnrolled && (
            <LeaveCourseButton courseId={course.id} courseTitle={course.title} />
          )}
        </div>
      </aside>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function NotEnrolledNote(): React.JSX.Element {
  return (
    <p className="flex gap-2 rounded-2xl bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>
        You&apos;re reading without being enrolled, so nothing is being tracked.
        Open a lesson to join and start recording progress.
      </span>
    </p>
  );
}

function NoLessonsYet(): React.JSX.Element {
  return (
    <div className="animate-pop relative overflow-hidden rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
      <div
        aria-hidden
        className="bg-dots mask-radial-fade pointer-events-none absolute inset-0 opacity-50"
      />
      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
          <BookOpen className="h-7 w-7" />
        </span>
        <div>
          <h3 className="font-display text-xl font-extrabold">
            No lessons published yet
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            This course doesn&apos;t have any lessons you can open. Check back
            once the instructor adds content.
          </p>
        </div>
      </div>
    </div>
  );
}
