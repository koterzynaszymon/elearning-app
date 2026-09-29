"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { rateCourse } from "@/lib/data-access/course-ratings";
import type { CourseRatingSummary } from "@/app/types/learn";

interface CourseRatingProps {
  readonly courseId: string;
  readonly isEnrolled: boolean;
  readonly summary: CourseRatingSummary;
}

export function CourseRating({
  courseId,
  isEnrolled,
  summary,
}: CourseRatingProps): React.JSX.Element {
  const [current, setCurrent] = useState(summary);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayValue = hovered ?? current.myRating ?? 0;

  const handleRate = async (rating: number): Promise<void> => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await rateCourse(courseId, rating);
    setSubmitting(false);
    if (result.success) {
      setCurrent(result.data);
      return;
    }
    setError(result.error);
  };

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-muted-foreground">
          Rating
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "h-4 w-4",
                  current.average !== null && n <= Math.round(current.average)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <span className="text-sm font-bold tabular-nums">
            {current.average !== null ? current.average.toFixed(1) : "—"}
          </span>
          {current.count > 0 && (
            <span className="text-xs text-muted-foreground">
              ({current.count})
            </span>
          )}
        </div>
      </div>

      {isEnrolled && (
        <div className="flex items-center gap-3">
          <div
            role="radiogroup"
            aria-label="Rate this course"
            className="flex items-center gap-0.5"
            onMouseLeave={() => setHovered(null)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={current.myRating === n}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                disabled={submitting}
                onMouseEnter={() => setHovered(n)}
                onFocus={() => setHovered(n)}
                onClick={() => {
                  void handleRate(n);
                }}
                className="rounded-full p-0.5 text-muted-foreground/40 transition-colors hover:text-amber-400 disabled:opacity-60"
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    n <= displayValue && "fill-amber-400 text-amber-400",
                  )}
                />
              </button>
            ))}
          </div>
          {submitting && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {!submitting && current.myRating !== null && (
            <span className="text-xs font-semibold text-mint">
              You rated this {current.myRating}
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-destructive">{error}</p>
      )}
    </div>
  );
}
