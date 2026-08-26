"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  FileEdit,
  Plus,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthoredCourseCard } from "./authored-course-card";
import type { AuthorFilter, AuthoredCourse } from "./types";

interface AuthorSpaceViewProps {
  readonly courses: readonly AuthoredCourse[];
}

const FILTERS: readonly { readonly value: AuthorFilter; readonly label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export function AuthorSpaceView({ courses }: AuthorSpaceViewProps): React.JSX.Element {
  const [filter, setFilter] = useState<AuthorFilter>("all");

  const counts = useMemo(() => {
    return courses.reduce(
      (acc, course) => {
        acc.all += 1;
        acc[course.status] += 1;
        return acc;
      },
      { all: 0, draft: 0, published: 0 } as Record<AuthorFilter, number>,
    );
  }, [courses]);

  const results = useMemo<AuthoredCourse[]>(() => {
    if (filter === "all") return [...courses];
    return courses.filter((course) => course.status === filter);
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
          label="Total courses"
        />
        <StatCard
          icon={Rocket}
          tint="bg-mint/15 text-mint"
          value={counts.published}
          label="Published"
        />
        <StatCard
          icon={FileEdit}
          tint="bg-amber-400/15 text-amber-600 dark:text-amber-400"
          value={counts.draft}
          label="Drafts"
        />
        <NewCourseCard />
      </section>

      {/* Filter tabs */}
      <div
        role="radiogroup"
        aria-label="Filter courses by status"
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
            <AuthoredCourseCard
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

function NewCourseCard(): React.JSX.Element {
  return (
    <Link
      href="/dashboard/create-course"
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-400 to-brand-600 p-5 text-primary-foreground shadow-soft transition-transform hover:-translate-y-1"
    >
      <div
        aria-hidden
        className="bg-dots pointer-events-none absolute inset-0 opacity-40"
      />
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/20 backdrop-blur transition-transform group-hover:scale-110">
        <Plus className="h-5 w-5" />
      </span>
      <div className="relative min-w-0">
        <p className="font-display text-lg font-extrabold leading-none">
          New course
        </p>
        <p className="mt-1 truncate text-sm text-primary-foreground/85">
          Start a fresh draft
        </p>
      </div>
    </Link>
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
          <Sparkles className="h-7 w-7" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-extrabold">
            No courses yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            You haven&apos;t created any courses. Start a new draft to build
            your first curriculum.
          </p>
        </div>
        <Link
          href="/dashboard/create-course"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Create a course
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
          No courses match this filter right now. Switch back to see
          everything you&apos;ve created.
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
