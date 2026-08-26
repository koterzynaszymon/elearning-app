import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileEdit,
  Globe,
  Lock,
  Rocket,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseType } from "@/app/types/course";

interface CourseManageViewProps {
  readonly course: CourseType;
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CourseManageView({
  course,
}: CourseManageViewProps): React.JSX.Element {
  const isPublished = course.status === "published";

  return (
    <div className="flex flex-col gap-6">
      {/* Info strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        <InfoTile
          icon={isPublished ? Rocket : FileEdit}
          tint={
            isPublished
              ? "bg-mint/15 text-mint"
              : "bg-amber-400/15 text-amber-600 dark:text-amber-400"
          }
          label="Status"
          value={isPublished ? "Published" : "Draft"}
        />
        <InfoTile
          icon={course.is_public ? Globe : Lock}
          tint="bg-primary/10 text-primary"
          label="Visibility"
          value={course.is_public ? "Public" : "Private"}
        />
        <InfoTile
          icon={CalendarClock}
          tint="bg-secondary text-secondary-foreground"
          label="Last updated"
          value={formatUpdatedAt(course.updated_at)}
        />
      </section>

      {/* Management actions */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ManageCard
          href={isPublished ? undefined : `/dashboard/create-course/${course.id}`}
          icon={FileEdit}
          title="Content"
          description={
            isPublished
              ? "Lesson structure is frozen once a course is published, so learner progress stays intact."
              : "Edit lessons, curriculum order, and course materials."
          }
          disabledLabel={isPublished ? "Locked" : undefined}
        />
        <ManageCard
          icon={Users}
          title="Students"
          description="See who's enrolled and track their progress."
          disabledLabel="Coming soon"
        />
        <ManageCard
          icon={Settings}
          title="Settings"
          description="Manage visibility, password, and course details."
          disabledLabel="Coming soon"
        />
      </section>
    </div>
  );
}

interface InfoTileProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly tint: string;
  readonly label: string;
  readonly value: string;
}

function InfoTile({
  icon: Icon,
  tint,
  label,
  value,
}: InfoTileProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          tint,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-extrabold leading-none">
          {value}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface ManageCardProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly title: string;
  readonly description: string;
  readonly href?: string;
  /** When set, the card renders disabled with this text as its badge (e.g. "Locked", "Coming soon"). */
  readonly disabledLabel?: string;
}

function ManageCard({
  icon: Icon,
  title,
  description,
  href,
  disabledLabel,
}: ManageCardProps): React.JSX.Element {
  const disabled = disabledLabel !== undefined;

  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        {disabled ? (
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
            {disabledLabel}
          </span>
        ) : (
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:text-primary" />
        )}
      </div>
      <h3 className="mt-4 font-display text-lg font-extrabold leading-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </>
  );

  if (disabled || href === undefined) {
    return (
      <div
        className="flex cursor-not-allowed flex-col rounded-3xl border border-dashed border-border bg-card/60 p-5 opacity-70"
        aria-disabled
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group/btn flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
    >
      {content}
    </Link>
  );
}
