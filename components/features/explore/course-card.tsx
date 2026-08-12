"use client";

import { BookOpen, Check, Globe, Loader2, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExploreCourse } from "./types";

const COVERS: readonly string[] = [
  "from-brand-400 to-brand-600",
  "from-brand-300 to-brand-500",
  "from-mint/70 to-mint",
  "from-brand-500 to-mint",
];

interface CourseCardProps {
  readonly course: ExploreCourse;
  readonly joined: boolean;
  readonly joining?: boolean;
  readonly accentIndex: number;
  readonly onJoin: (course: ExploreCourse) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CourseCard({
  course,
  joined,
  joining = false,
  accentIndex,
  onJoin,
}: CourseCardProps): React.JSX.Element {
  const cover = COVERS[accentIndex % COVERS.length];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-soft transition-all hover:-translate-y-1",
        joined ? "border-mint/50" : "border-border hover:border-primary/40",
      )}
    >
      {/* Cover */}
      <div
        className={cn(
          "relative flex h-24 items-end bg-gradient-to-br p-4",
          cover,
        )}
      >
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-50"
        />
        <BookOpen className="relative h-6 w-6 text-primary-foreground" />
        <span
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold backdrop-blur",
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
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 justify-between">
        <h3 className="line-clamp-2 break-words font-display text-lg font-extrabold leading-tight">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-extrabold text-primary-foreground">
            {initials(course.authorName)}
          </span>
          <span className="truncate text-xs font-semibold text-muted-foreground">
            {course.authorName}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {course.studentCount.toLocaleString()}
          </span>
        </div>

        {/* Action */}
        <div className="mt-5">
          {joined ? (
            <Button
              type="button"
              variant="secondary"
              disabled
              className="w-full rounded-full border border-mint/40 bg-mint/10 text-mint hover:bg-mint/10"
            >
              <Check className="h-4 w-4" />
              Joined
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => onJoin(course)}
              disabled={joining}
              className="group/btn w-full rounded-full shadow-glow"
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining…
                </>
              ) : course.isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  Join course
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Join with password
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
