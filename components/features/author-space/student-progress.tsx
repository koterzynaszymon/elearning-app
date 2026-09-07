import { Users } from "lucide-react";
import { ProgressDial, progressPercent } from "@/components/features/learn/progress-dial";
import type { CourseRosterEntry } from "@/app/types/author";

interface StudentProgressProps {
  readonly courseTitle: string;
  readonly students: readonly CourseRosterEntry[];
}

function formatEnrolledAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentProgress({
  courseTitle,
  students,
}: StudentProgressProps): React.JSX.Element {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">
            No progress to show
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Once learners join{" "}
            <span className="font-semibold text-foreground">{courseTitle}</span>{" "}
            and start working through the lessons, their progress shows up here.
          </p>
        </div>
      </div>
    );
  }

  const finishedCount = students.filter(
    (s) => s.totalLessons > 0 && s.completedLessons >= s.totalLessons,
  ).length;
  const averagePercent = Math.round(
    students.reduce(
      (sum, s) => sum + progressPercent(s.completedLessons, s.totalLessons),
      0,
    ) / students.length,
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryTile label="Enrolled" value={String(students.length)} />
        <SummaryTile label="Average completion" value={`${averagePercent}%`} />
        <SummaryTile label="Finished the course" value={String(finishedCount)} />
      </section>

      <ul className="flex flex-col gap-3">
        {students.map((student) => (
          <li
            key={student.userId}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <ProgressDial
              completed={student.completedLessons}
              total={student.totalLessons}
              className="h-14 w-14 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-extrabold leading-tight">
                {student.displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {student.completedLessons} / {student.totalLessons} lessons
                <span aria-hidden> · </span>
                Joined {formatEnrolledAt(student.enrolledAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SummaryTileProps {
  readonly label: string;
  readonly value: string;
}

function SummaryTile({ label, value }: SummaryTileProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="font-display text-3xl font-extrabold leading-none tabular-nums">
        {value}
      </p>
      <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
