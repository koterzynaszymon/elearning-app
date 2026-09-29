"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  BarChart3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Search,
  SearchX,
  Star,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enrollInCourse } from "@/lib/data-access/enrollments";
import { cn } from "@/lib/utils";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/app/types/course";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/constants/course-taxonomy";
import { CourseCard } from "./course-card";
import type {
  CategoryFilter,
  ExploreCourse,
  LevelFilter,
  RatingFilter,
  SortMode,
  VisibilityFilter,
} from "./types";

interface ExploreCatalogueProps {
  readonly courses: readonly ExploreCourse[];
  readonly initialJoinedIds?: readonly string[];
}

const VISIBILITY_FILTERS: readonly {
  readonly value: VisibilityFilter;
  readonly label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const SORT_MODES: readonly { readonly value: SortMode; readonly label: string }[] =
  [
    { value: "popular", label: "Most joined" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Top rated" },
    { value: "az", label: "A–Z" },
  ];

const CATEGORY_FILTERS: readonly { readonly value: CategoryFilter; readonly label: string }[] =
  [
    { value: "all", label: "All categories" },
    ...COURSE_CATEGORIES.map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
    })),
  ];

const LEVEL_FILTERS: readonly { readonly value: LevelFilter; readonly label: string }[] =
  [
    { value: "all", label: "All levels" },
    ...COURSE_LEVELS.map((value) => ({ value, label: LEVEL_LABELS[value] })),
  ];

const RATING_FILTERS: readonly { readonly value: RatingFilter; readonly label: string }[] =
  [
    { value: "all", label: "Any rating" },
    { value: 4, label: "4+ stars" },
    { value: 3, label: "3+ stars" },
    { value: 2, label: "2+ stars" },
    { value: 1, label: "1+ stars" },
  ];

function matchesQuery(course: ExploreCourse, query: string): boolean {
  const haystack =
    `${course.title} ${course.description} ${course.authorName}`.toLowerCase();
  return haystack.includes(query);
}

function sortCourses(
  courses: readonly ExploreCourse[],
  mode: SortMode,
): ExploreCourse[] {
  const next = [...courses];
  switch (mode) {
    case "az":
      return next.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return next.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "popular":
      return next.sort((a, b) => b.studentCount - a.studentCount);
    case "rating":
      return next.sort(
        (a, b) => (b.averageRating ?? -1) - (a.averageRating ?? -1),
      );
  }
}

export function ExploreCatalogue({
  courses,
  initialJoinedIds = [],
}: ExploreCatalogueProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [minRating, setMinRating] = useState<RatingFilter>("all");
  const [sort, setSort] = useState<SortMode>("popular");
  const [joined, setJoined] = useState<ReadonlySet<string>>(
    () => new Set(initialJoinedIds),
  );
  const [joinTarget, setJoinTarget] = useState<ExploreCourse | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const results = useMemo<ExploreCourse[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      if (visibility === "public" && !course.isPublic) return false;
      if (visibility === "private" && course.isPublic) return false;
      if (category !== "all" && course.category !== category) return false;
      if (level !== "all" && course.level !== level) return false;
      if (
        minRating !== "all" &&
        (course.averageRating === null || course.averageRating < minRating)
      ) {
        return false;
      }
      if (normalizedQuery && !matchesQuery(course, normalizedQuery)) {
        return false;
      }
      return true;
    });
    return sortCourses(filtered, sort);
  }, [courses, query, visibility, category, level, minRating, sort]);

  const markJoined = useCallback((id: string): void => {
    setJoined((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleJoin = useCallback(
    async (course: ExploreCourse): Promise<void> => {
      if (course.isPublic) {
        setJoinError(null);
        setJoiningId(course.id);
        const result = await enrollInCourse(course.id, null);
        setJoiningId(null);
        if (result.success) {
          markJoined(course.id);
          return;
        }
        setJoinError(result.error);
        return;
      }
      setJoinError(null);
      setJoinTarget(course);
    },
    [markJoined],
  );

  const hasResults = results.length > 0;
  const isFiltering =
    query.trim().length > 0 ||
    visibility !== "all" ||
    category !== "all" ||
    level !== "all" ||
    minRating !== "all";
  const catalogueEmpty = courses.length === 0;

  const resetFilters = useCallback((): void => {
    setQuery("");
    setVisibility("all");
    setCategory("all");
    setLevel("all");
    setMinRating("all");
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Search + controls */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics or instructors…"
            className="h-12 rounded-2xl pl-11 pr-11 text-base"
            aria-label="Search courses"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Visibility filter */}
          <div
            role="radiogroup"
            aria-label="Filter by visibility"
            className="flex items-center gap-1 rounded-full bg-secondary/60 p-1"
          >
            {VISIBILITY_FILTERS.map(({ value, label }) => (
              <Pill
                key={value}
                active={visibility === value}
                onClick={() => setVisibility(value)}
              >
                {label}
              </Pill>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:flex">
              <ArrowDownWideNarrow className="h-3.5 w-3.5" />
              Sort
            </span>
            <div className="flex items-center gap-1 rounded-full bg-secondary/60 p-1">
              {SORT_MODES.map(({ value, label }) => (
                <Pill
                  key={value}
                  active={sort === value}
                  onClick={() => setSort(value)}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {/* Category, level & rating filters */}
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
          <FilterGroup icon={Tag} label="Category">
            {CATEGORY_FILTERS.map(({ value, label }) => (
              <Pill
                key={value}
                active={category === value}
                onClick={() => setCategory(value)}
              >
                {label}
              </Pill>
            ))}
          </FilterGroup>

          <FilterGroup icon={BarChart3} label="Level">
            {LEVEL_FILTERS.map(({ value, label }) => (
              <Pill
                key={value}
                active={level === value}
                onClick={() => setLevel(value)}
              >
                {label}
              </Pill>
            ))}
          </FilterGroup>

          <FilterGroup icon={Star} label="Rating">
            {RATING_FILTERS.map(({ value, label }) => (
              <Pill
                key={value}
                active={minRating === value}
                onClick={() => setMinRating(value)}
              >
                {label}
              </Pill>
            ))}
          </FilterGroup>

          {isFiltering && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto flex items-center gap-1 self-start rounded-full px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="px-1 text-sm text-muted-foreground">
        {hasResults ? (
          <>
            <span className="font-bold text-foreground">{results.length}</span>{" "}
            course{results.length === 1 ? "" : "s"}
            {isFiltering ? " match your search" : " to explore"}
          </>
        ) : catalogueEmpty ? (
          "No published courses yet"
        ) : (
          "No courses found"
        )}
      </p>

      {joinError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive">
          {joinError}
        </p>
      )}

      {/* Grid or empty state */}
      {hasResults ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              joined={joined.has(course.id)}
              joining={joiningId === course.id}
              accentIndex={index}
              onJoin={(c) => {
                void handleJoin(c);
              }}
            />
          ))}
        </div>
      ) : catalogueEmpty ? (
        <CatalogueEmptyState />
      ) : (
        <EmptyState onReset={resetFilters} />
      )}

      {/* Private join modal */}
      {joinTarget && (
        <JoinPrivateModal
          course={joinTarget}
          onClose={() => setJoinTarget(null)}
          onJoined={(id) => {
            markJoined(id);
            setJoinTarget(null);
          }}
        />
      )}
    </div>
  );
}

interface FilterGroupProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly children: React.ReactNode;
}

function FilterGroup({
  icon: Icon,
  label,
  children,
}: FilterGroupProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="flex flex-wrap items-center gap-1 rounded-full bg-secondary/60 p-1"
      >
        {children}
      </div>
    </div>
  );
}

interface PillProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}

function Pill({ active, onClick, children }: PillProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
        active
          ? "bg-card text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function CatalogueEmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
        <SearchX className="h-7 w-7" />
      </span>
      <div>
        <h3 className="font-display text-xl font-extrabold">
          The catalogue is quiet
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          No published courses yet. Once instructors hit publish, they&apos;ll
          show up here for students to join.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
        <SearchX className="h-7 w-7" />
      </span>
      <div>
        <h3 className="font-display text-xl font-extrabold">
          Nothing matches (yet)
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Try a different keyword, or clear your filters to see the whole
          catalogue.
        </p>
      </div>
      <Button type="button" variant="secondary" onClick={onReset} className="rounded-full">
        Clear filters
      </Button>
    </div>
  );
}

interface JoinPrivateModalProps {
  readonly course: ExploreCourse;
  readonly onClose: () => void;
  readonly onJoined: (id: string) => void;
}

function JoinPrivateModal({
  course,
  onClose,
  onJoined,
}: JoinPrivateModalProps): React.JSX.Element {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (password.trim().length === 0) {
      setError("Please enter the course password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await enrollInCourse(course.id, password);
    setSubmitting(false);
    if (result.success) {
      onJoined(course.id);
      return;
    }
    setError(result.error);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Join ${course.title}`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />

      <div className="animate-pop relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold leading-tight">
                Join this private course
              </h2>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {course.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="flex flex-col gap-4 p-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="join-password"
              className="flex items-center gap-1.5 text-sm font-bold"
            >
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              Access password
            </Label>
            <div className="relative">
              <Input
                id="join-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter the password from your instructor"
                autoComplete="off"
                autoFocus
                disabled={submitting}
                className="h-11 rounded-xl pr-11 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-xs font-semibold text-destructive">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full px-6 shadow-glow"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {submitting ? "Joining…" : "Join course"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
