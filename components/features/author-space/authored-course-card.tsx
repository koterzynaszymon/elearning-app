"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileEdit,
  Globe,
  Lock,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthoredCourse } from "./types";

const COVERS: readonly string[] = [
  "from-brand-400 to-brand-600",
  "from-brand-300 to-brand-500",
  "from-mint/70 to-mint",
  "from-brand-500 to-mint",
];

interface AuthoredCourseCardProps {
  readonly course: AuthoredCourse;
  readonly accentIndex: number;
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AuthoredCourseCard({
  course,
  accentIndex,
}: AuthoredCourseCardProps): React.JSX.Element {
  const cover = COVERS[accentIndex % COVERS.length];
  const isPublished = course.status === "published";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-soft transition-all hover:-translate-y-1",
        isPublished
          ? "border-border hover:border-primary/40"
          : "border-dashed border-border hover:border-primary/40",
      )}
    >
      {/* Cover */}
      <div className={cn("relative flex h-28 items-end bg-gradient-to-br p-4", cover)}>
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-50"
        />
        <FileEdit className="relative h-6 w-6 text-primary-foreground" />

        <span className="absolute left-4 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold text-foreground backdrop-blur">
          {course.isPublic ? (
            <Globe className="h-2.5 w-2.5" />
          ) : (
            <Lock className="h-2.5 w-2.5" />
          )}
          {course.isPublic ? "Public" : "Private"}
        </span>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur">
          {isPublished ? <Rocket className="h-2.5 w-2.5" /> : null}
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 break-words font-display text-lg font-extrabold leading-tight">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
          {course.description || "No description yet."}
        </p>

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          Updated {formatUpdatedAt(course.updatedAt)}
        </span>

        <Link
          href={`/dashboard/author-space/${course.id}`}
          className="group/btn mt-5 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95"
        >
          Manage course
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
