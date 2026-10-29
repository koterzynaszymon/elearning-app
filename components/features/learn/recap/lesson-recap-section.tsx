import { Sparkles } from "lucide-react";
import { LessonRecap } from "./lesson-recap";
import { RecapUnavailable } from "./recap-unavailable";
import type { RecapAvailability } from "./types";

interface LessonRecapSectionProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly availability: RecapAvailability;
  readonly materialsAnchor: string;
}

export function LessonRecapSection({
  lessonId,
  lessonTitle,
  availability,
  materialsAnchor,
}: LessonRecapSectionProps): React.JSX.Element | null {
  // The lesson body already shows its own empty state.
  if (availability.kind === "empty") return null;

  return (
    <section aria-labelledby="lesson-recap-heading" className="flex flex-col gap-3">
      <h2
        id="lesson-recap-heading"
        className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-muted-foreground"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Recap
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] tracking-[0.14em] text-secondary-foreground">
          AI · on demand
        </span>
      </h2>

      {availability.kind === "available" ? (
        <LessonRecap
          // Fresh state per lesson — cached results never leak across lessons.
          key={lessonId}
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          hasAttachments={availability.hasAttachments}
        />
      ) : (
        <RecapUnavailable
          reason={availability.kind}
          materialsAnchor={materialsAnchor}
        />
      )}
    </section>
  );
}
