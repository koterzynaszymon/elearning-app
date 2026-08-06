"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CircleAlert,
  Globe,
  KeyRound,
  LayoutGrid,
  Loader2,
  Lock,
  PartyPopper,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseType } from "@/app/types/course";
import { publishCourse } from "@/lib/data-access/courses";
import { cn } from "@/lib/utils";

interface PublishPanelProps {
  readonly course: CourseType;
}

type PublishState =
  | { status: "idle" }
  | { status: "publishing" }
  | { status: "published" }
  | { status: "error"; message: string };

interface PublishCheck {
  readonly label: string;
  readonly hint: string;
  readonly satisfied: boolean;
  readonly optional?: boolean;
}

export function PublishPanel({ course }: PublishPanelProps): React.JSX.Element {
  const [publishState, setPublishState] = useState<PublishState>({
    status: "idle",
  });

  const checks = useMemo<readonly PublishCheck[]>(() => {
    const hasTitle = course.title.trim().length > 0;
    const hasDescription = (course.description ?? "").trim().length > 0;
    const accessReady = course.is_public || course.password_hash !== null;
    return [
      {
        label: "Course has a title",
        hint: "Students see this first in the catalogue.",
        satisfied: hasTitle,
      },
      {
        label: "Description added",
        hint: "A warm summary helps students decide.",
        satisfied: hasDescription,
        optional: true,
      },
      {
        label: course.is_public
          ? "Visibility set to public"
          : "Access password is set",
        hint: course.is_public
          ? "Anyone can discover and join this course."
          : "Only people with the password can enrol.",
        satisfied: accessReady,
      },
    ];
  }, [course]);

  const blockers = checks.filter((c) => !c.satisfied && !c.optional).length;
  const canPublish = blockers === 0;
  const isPublishing = publishState.status === "publishing";

  const handlePublish = useCallback(async (): Promise<void> => {
    if (!canPublish) return;
    setPublishState({ status: "publishing" });
    const result = await publishCourse(course.id);
    setPublishState(
      result.success
        ? { status: "published" }
        : { status: "error", message: result.error },
    );
  }, [canPublish, course.id]);

  if (publishState.status === "published") {
    return <PublishedCelebration course={course} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* Left: review + checklist */}
      <div className="flex flex-col gap-6">
        <ReviewCard course={course} />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mint/15 text-mint">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold leading-tight">
                Pre-flight check
              </h2>
              <p className="text-xs text-muted-foreground">
                A quick look before you go live.
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5">
            {checks.map((check) => (
              <li
                key={check.label}
                className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-3.5"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    check.satisfied
                      ? "bg-mint/15 text-mint"
                      : check.optional
                        ? "bg-secondary text-muted-foreground"
                        : "bg-destructive/10 text-destructive",
                  )}
                >
                  {check.satisfied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <CircleAlert className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {check.label}
                    {check.optional && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Optional
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{check.hint}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href={`/dashboard/create-course/${course.id}`}
            className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <LayoutGrid className="h-4 w-4" />
            Need lessons? Head back to the curriculum
          </Link>
        </section>
      </div>

      {/* Right: the publish action */}
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-50 to-accent/40 p-6 shadow-soft dark:from-card dark:to-accent/20">
          <div
            aria-hidden
            className="bg-dots mask-radial-fade pointer-events-none absolute inset-0 opacity-60"
          />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-primary-foreground shadow-glow">
              <Rocket className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
              Ready for takeoff?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Publishing moves{" "}
              <span className="font-semibold text-foreground">
                {course.title}
              </span>{" "}
              from a private draft to{" "}
              {course.is_public
                ? "the public catalogue."
                : "a password-protected course students can enrol in."}
            </p>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              className="group mt-6 h-12 w-full rounded-full text-base shadow-glow"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                  Publish course
                </>
              )}
            </Button>

            {!canPublish && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <CircleAlert className="h-3.5 w-3.5" />
                Resolve the pre-flight items to publish.
              </p>
            )}
            {publishState.status === "error" && (
              <p className="mt-3 text-xs font-semibold text-destructive">
                {publishState.message}
              </p>
            )}

            <Link
              href="/dashboard"
              className="mt-4 block text-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Save as draft &amp; leave
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}

function ReviewCard({ course }: { course: CourseType }): React.JSX.Element {
  const isPrivate = !course.is_public;
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="relative flex h-32 items-end overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 p-5">
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-50"
        />
        <BookOpen className="relative h-8 w-8 text-primary-foreground" />
        <span
          className={cn(
            "absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold backdrop-blur",
            isPrivate ? "text-foreground" : "text-mint",
          )}
        >
          {isPrivate ? (
            <Lock className="h-2.5 w-2.5" />
          ) : (
            <Globe className="h-2.5 w-2.5" />
          )}
          {isPrivate ? "Private" : "Public"}
        </span>
      </div>
      <div className="p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
            {course.status}
          </span>
          {isPrivate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">
              <KeyRound className="h-2.5 w-2.5" />
              Password protected
            </span>
          )}
        </div>
        <h2 className="break-words font-display text-2xl font-extrabold leading-tight">
          {course.title}
        </h2>
        <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
          {course.description?.trim() ||
            "No description yet — students will only see the title."}
        </p>
      </div>
    </section>
  );
}

function PublishedCelebration({
  course,
}: {
  course: CourseType;
}): React.JSX.Element {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-50 to-accent/50 p-10 text-center shadow-soft dark:from-card dark:to-accent/20">
      <div
        aria-hidden
        className="bg-dots mask-radial-fade pointer-events-none absolute inset-0 opacity-70"
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <span className="animate-float-soft flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 text-primary-foreground shadow-glow">
          <PartyPopper className="h-9 w-9" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          You&apos;re <span className="text-gradient-brand">live!</span>
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          <span className="font-semibold text-foreground">{course.title}</span>{" "}
          is published{" "}
          {course.is_public
            ? "and now discoverable in the catalogue."
            : "and ready for students with the password."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="group h-12 rounded-full px-6 text-base shadow-glow">
            <Link href="/dashboard">
              Go to dashboard
              <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-2 bg-card/60 px-6 text-base"
          >
            <Link href={`/dashboard/create-course/${course.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Keep editing
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
