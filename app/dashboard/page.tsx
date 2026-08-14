import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Lock,
  PenLine,
  Plus,
  Sparkles,
  Ticket,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDraftCoursesByAuthor } from "@/lib/data-access/courses";
import { getEnrolledCourseIds } from "@/lib/data-access/enrollments";
import { Button } from "@/components/ui/button";
import type { CourseType } from "@/app/types/course";

interface Stat {
  readonly label: string;
  readonly value: number;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly tint: string;
}

const STEPS: readonly { readonly title: string; readonly hint: string }[] = [
  { title: "Join or create a course", hint: "This is your very first step." },
  { title: "Complete your profile", hint: "Add a name and a photo." },
  { title: "Finish your first lesson", hint: "Small wins add up fast." },
];

function friendlyName(email: string): string {
  const handle = email.split("@")[0] ?? "there";
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

function formatEdited(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : "there@lumen";
  const name = friendlyName(email);
  const [drafts, enrolledIds] = await Promise.all([
    getDraftCoursesByAuthor(),
    getEnrolledCourseIds(),
  ]);
  const enrolledCount = enrolledIds.length;

  const stats: readonly Stat[] = [
    {
      label: "Courses enrolled",
      value: enrolledCount,
      icon: BookOpen,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "In progress",
      value: 0,
      icon: Clock,
      tint: "bg-mint/15 text-mint",
    },
    {
      label: "Completed",
      value: 0,
      icon: CheckCircle2,
      tint: "bg-amber-400/15 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Ready to learn?
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Hi again, <span className="text-gradient-brand">{name}</span>!
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          {enrolledCount > 0
            ? `You're enrolled in ${enrolledCount} course${enrolledCount === 1 ? "" : "s"} — keep the momentum going.`
            : "You don't have any courses yet — let's find you something great to learn."}
        </p>
      </header>

      {/* Continue with your drafts */}
      {drafts.length > 0 && (
        <section className="animate-pop [animation-delay:60ms]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <PenLine className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold leading-tight">
                  Continue with your draft
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pick up right where you left off.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
              {drafts.length} draft{drafts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </section>
      )}

      {/* Welcome hero + getting started */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Friendly empty-state hero (the only place the actions live) */}
        <section className="animate-pop relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-50 to-accent/50 p-8 shadow-soft [animation-delay:80ms] sm:p-10 dark:from-card dark:to-accent/20">
          <div
            aria-hidden
            className="bg-dots mask-radial-fade pointer-events-none absolute inset-0 opacity-70"
          />

          {/* Floating illustration cluster */}
          <div aria-hidden className="pointer-events-none absolute right-6 top-6 hidden sm:block">
            <div className="animate-float-soft relative h-28 w-28">
              <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-brand-400 to-brand-600 opacity-90 shadow-glow" />
              <GraduationCap className="absolute inset-0 m-auto h-12 w-12 text-primary-foreground" />
              <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-mint/20 text-mint backdrop-blur">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="absolute -bottom-3 -left-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-soft">
                <BookOpen className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="relative max-w-sm">
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Your learning starts here
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Create a course to teach what you know, or jump into one with an
              invite code from your instructor. It only takes a minute.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                className="group h-12 rounded-full px-6 text-base shadow-glow"
              >
                <Link href="/dashboard/create-course">
                  <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  Create a course
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-2 bg-card/60 px-6 text-base"
              >
                <Ticket className="h-4 w-4" />
                Join with a code
              </Button>
            </div>
          </div>
        </section>

        {/* Getting started checklist */}
        <section className="animate-pop rounded-3xl border border-border bg-card p-6 shadow-soft [animation-delay:160ms]">
          <h3 className="font-display text-lg font-bold">Getting started</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Three small steps to settle in.
          </p>

          <ol className="mt-5 flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {i + 1}
                </span>
                <div className="leading-tight">
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.hint}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            href="/dashboard/explore"
            className="group mt-6 flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Browse the catalogue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </div>

      {/* Soft stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tint }, i) => (
          <div
            key={label}
            className="animate-pop flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-1"
            style={{ animationDelay: `${220 + i * 70}ms` }}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tint}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-3xl font-extrabold leading-none tabular-nums">
                {value}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {label}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function DraftCard({ draft }: { draft: CourseType }): React.JSX.Element {
  return (
    <Link
      href={`/dashboard/create-course/${draft.id}`}
      className="group flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">
          {draft.is_public ? (
            <Globe className="h-2.5 w-2.5" />
          ) : (
            <Lock className="h-2.5 w-2.5" />
          )}
          {draft.is_public ? "Public" : "Private"}
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
          Draft
        </span>
      </div>

      <h3 className="line-clamp-2 break-words font-display text-lg font-extrabold leading-tight">
        {draft.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">
        {draft.description?.trim() || "No description yet."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Edited {formatEdited(draft.updated_at)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
          Continue
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
