"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe,
  Lock,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseProgressStatus, EnrolledCourse } from "./types";

const COVERS: readonly string[] = [
  "from-brand-400 to-brand-600",
  "from-brand-300 to-brand-500",
  "from-mint/70 to-mint",
  "from-brand-500 to-mint",
];

const RING_CIRCUMFERENCE = 2 * Math.PI * 20;
const FULL_PROGRESS = 100;

interface EnrolledCourseCardProps {
  readonly course: EnrolledCourse;
  readonly accentIndex: number;
}

function progressStatus(course: EnrolledCourse): CourseProgressStatus {
  if (course.completedLessons <= 0) return "not-started";
  if (course.completedLessons >= course.lessonCount) return "completed";
  return "in-progress";
}

function progressPercent(course: EnrolledCourse): number {
  if (course.lessonCount <= 0) return 0;
  return Math.round((course.completedLessons / course.lessonCount) * FULL_PROGRESS);
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const CTA: Record<
  CourseProgressStatus,
  { readonly label: string; readonly icon: React.ComponentType<{ className?: string }> }
> = {
  "not-started": { label: "Start learning", icon: PlayCircle },
  "in-progress": { label: "Continue", icon: ArrowRight },
  completed: { label: "Review course", icon: RotateCcw },
};

export function EnrolledCourseCard({
  course,
  accentIndex,
}: EnrolledCourseCardProps): React.JSX.Element {
  const cover = COVERS[accentIndex % COVERS.length];
  const status = progressStatus(course);
  const percent = progressPercent(course);
  const isDone = status === "completed";
  const { label: ctaLabel, icon: CtaIcon } = CTA[status];
  const dashOffset = RING_CIRCUMFERENCE * (1 - percent / FULL_PROGRESS);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-soft transition-all hover:-translate-y-1",
        isDone ? "border-mint/50" : "border-border hover:border-primary/40",
      )}
    >
      {/* Cover with progress ring */}
      <div className={cn("relative flex h-28 items-end bg-gradient-to-br p-4", cover)}>
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-50"
        />
        <BookOpen className="relative h-6 w-6 text-primary-foreground" />

        <span
          className={cn(
            "absolute left-4 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold backdrop-blur",
            course.isPublic ? "text-mint" : "text-foreground",
          )}
        >
          {course.isPublic ? (
            <Globe className="h-2.5 w-2.5" />
          ) : (
            <Lock className="h-2.5 w-2.5" />
          )}
          {course.isPublic ? "Public" : "Private"}
        </span>

        {/* Progress ring */}
        <div className="absolute right-3 top-3 flex h-14 w-14 items-center justify-center">
          <svg
            viewBox="0 0 48 48"
            className="h-14 w-14 -rotate-90"
            aria-hidden
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              strokeWidth="4"
              className="stroke-background/40"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-background transition-[stroke-dashoffset] duration-700 ease-out"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="absolute font-display text-xs font-extrabold text-primary-foreground tabular-nums">
            {isDone ? <CheckCircle2 className="h-4 w-4" /> : `${percent}%`}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
        </div>

        <h3 className="mt-2.5 line-clamp-2 break-words font-display text-lg font-extrabold leading-tight">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
          {course.description || "No description yet."}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-extrabold text-primary-foreground">
            {initials(course.authorName)}
          </span>
          <span className="truncate text-xs font-semibold text-muted-foreground">
            {course.authorName}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {course.completedLessons}/{course.lessonCount} lessons
            </span>
            <span className={cn("tabular-nums", isDone ? "text-mint" : "text-primary")}>
              {percent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-700 ease-out",
                isDone
                  ? "bg-gradient-to-r from-mint/80 to-mint"
                  : "bg-gradient-to-r from-brand-400 to-brand-600",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/dashboard/courses/${course.id}`}
          className={cn(
            "group/btn mt-5 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all",
            isDone
              ? "border border-mint/40 bg-mint/10 text-mint hover:bg-mint/15"
              : "bg-primary text-primary-foreground shadow-glow hover:opacity-95",
          )}
        >
          {status === "not-started" && <Sparkles className="h-4 w-4" />}
          {status !== "not-started" && <CtaIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />}
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  readonly status: CourseProgressStatus;
}): React.JSX.Element {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-mint">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Completed
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
        <PlayCircle className="h-2.5 w-2.5" />
        In progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
      <Sparkles className="h-2.5 w-2.5" />
      Not started
    </span>
  );
}
