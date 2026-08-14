"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Flame,
  PlayCircle,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnrolledCourseCard } from "./enrolled-course-card";
import type { CourseProgressStatus, EnrolledCourse, EnrolledFilter } from "./types";

interface MyCoursesViewProps {
  readonly courses: readonly EnrolledCourse[];
}

const FULL_PROGRESS = 100;

function statusOf(course: EnrolledCourse): CourseProgressStatus {
  if (course.completedLessons <= 0) return "not-started";
  if (course.completedLessons >= course.lessonCount) return "completed";
  return "in-progress";
}

function overallPercent(courses: readonly EnrolledCourse[]): number {
  const totals = courses.reduce(
    (acc, c) => ({
      done: acc.done + Math.min(c.completedLessons, c.lessonCount),
      total: acc.total + c.lessonCount,
    }),
    { done: 0, total: 0 },
  );
  if (totals.total <= 0) return 0;
  return Math.round((totals.done / totals.total) * FULL_PROGRESS);
}

const FILTERS: readonly { readonly value: EnrolledFilter; readonly label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-progress", label: "In progress" },
  { value: "not-started", label: "Not started" },
  { value: "completed", label: "Completed" },
];

export function MyCoursesView({ courses }: MyCoursesViewProps): React.JSX.Element {
  const [filter, setFilter] = useState<EnrolledFilter>("all");

  const counts = useMemo(() => {
    return courses.reduce(
      (acc, course) => {
        const status = statusOf(course);
        acc.all += 1;
        acc[status] += 1;
        return acc;
      },
      { all: 0, "in-progress": 0, "not-started": 0, completed: 0 } as Record<
        EnrolledFilter,
        number
      >,
    );
  }, [courses]);

  const results = useMemo<EnrolledCourse[]>(() => {
    if (filter === "all") return [...courses];
    return courses.filter((course) => statusOf(course) === filter);
  }, [courses, filter]);

  if (courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          tint="bg-primary/10 text-primary"
          value={counts.all}
          label="Enrolled"
        />
        <StatCard
          icon={PlayCircle}
          tint="bg-mint/15 text-mint"
          value={counts["in-progress"]}
          label="In progress"
        />
        <StatCard
          icon={Trophy}
          tint="bg-amber-400/15 text-amber-600 dark:text-amber-400"
          value={counts.completed}
          label="Completed"
        />
        <OverallCard percent={overallPercent(courses)} />
      </section>

      {/* Filter tabs */}
      <div
        role="radiogroup"
        aria-label="Filter courses by progress"
        className="flex flex-wrap items-center gap-1 rounded-full bg-secondary/60 p-1"
      >
        {FILTERS.map(({ value, label }) => (
          <FilterPill
            key={value}
            active={filter === value}
            count={counts[value]}
            onClick={() => setFilter(value)}
          >
            {label}
          </FilterPill>
        ))}
      </div>

      {/* Grid or filtered-empty */}
      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((course, index) => (
            <EnrolledCourseCard
              key={course.id}
              course={course}
              accentIndex={index}
            />
          ))}
        </div>
      ) : (
        <FilteredEmptyState onReset={() => setFilter("all")} />
      )}
    </div>
  );
}

interface StatCardProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly tint: string;
  readonly value: number;
  readonly label: string;
}

function StatCard({
  icon: Icon,
  tint,
  value,
  label,
}: StatCardProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-1">
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          tint,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-3xl font-extrabold leading-none tabular-nums">
          {value}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function OverallCard({ percent }: { readonly percent: number }): React.JSX.Element {
  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-400 to-brand-600 p-5 text-primary-foreground shadow-soft">
      <div
        aria-hidden
        className="bg-dots pointer-events-none absolute inset-0 opacity-40"
      />
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/20 backdrop-blur">
        <Flame className="h-5 w-5" />
      </span>
      <div className="relative min-w-0">
        <p className="font-display text-3xl font-extrabold leading-none tabular-nums">
          {percent}%
        </p>
        <p className="mt-1 truncate text-sm text-primary-foreground/85">
          Overall progress
        </p>
      </div>
    </div>
  );
}

interface FilterPillProps {
  readonly active: boolean;
  readonly count: number;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}

function FilterPill({
  active,
  count,
  onClick,
  children,
}: FilterPillProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
        active
          ? "bg-card text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
          active ? "bg-primary/10 text-primary" : "bg-background/60",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="animate-pop relative overflow-hidden rounded-3xl border border-dashed border-border bg-gradient-to-br from-brand-50 to-accent/50 p-12 text-center shadow-soft dark:from-card dark:to-accent/20">
      <div
        aria-hidden
        className="bg-dots mask-radial-fade pointer-events-none absolute inset-0 opacity-60"
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-primary-foreground shadow-glow">
          <BookOpen className="h-7 w-7" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-extrabold">
            No courses yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            You haven&apos;t joined any courses. Browse the catalogue and enroll
            to see your progress track here.
          </p>
        </div>
        <Link
          href="/dashboard/explore"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95"
        >
          <Compass className="h-4 w-4" />
          Explore courses
        </Link>
      </div>
    </div>
  );
}

function FilteredEmptyState({
  onReset,
}: {
  readonly onReset: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div>
        <h3 className="font-display text-xl font-extrabold">
          Nothing in this bucket
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          No courses match this filter right now. Switch back to see everything
          you&apos;re enrolled in.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
      >
        Show all courses
      </button>
    </div>
  );
}
