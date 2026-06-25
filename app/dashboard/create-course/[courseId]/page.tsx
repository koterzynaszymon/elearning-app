import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Globe,
  ListChecks,
  Lock,
  Rocket,
  Sparkles,
  Type,
} from "lucide-react";
import { getCourseById } from "@/lib/data-access/courses";
import { cn } from "@/lib/utils";

interface WizardStep {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const STEPS: readonly WizardStep[] = [
  { label: "Basics", icon: Type },
  { label: "Curriculum", icon: ListChecks },
  { label: "Publish", icon: Rocket },
];

const CURRENT_STEP_INDEX = 1;

interface CurriculumStepPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CurriculumStepPage({
  params,
}: CurriculumStepPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) {
    redirect("/dashboard/create-course");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Draft saved
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Add the <span className="text-gradient-brand">curriculum</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Your basics are safe. Next you&apos;ll break{" "}
          <span className="font-semibold text-foreground">{course.title}</span>{" "}
          into lessons.
        </p>
      </header>

      {/* Step indicator */}
      <ol className="animate-pop flex flex-wrap items-center gap-2 [animation-delay:40ms]">
        {STEPS.map(({ label, icon: Icon }, i) => {
          const current = i === CURRENT_STEP_INDEX;
          const done = i < CURRENT_STEP_INDEX;
          return (
            <li key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
                  current
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-secondary/60 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    current ? "bg-primary-foreground/20" : "bg-background/60",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : current ? <Icon className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="hidden h-px w-6 bg-border sm:block" />
              )}
            </li>
          );
        })}
        <li className="ml-1 hidden items-center gap-1 text-xs text-muted-foreground md:flex">
          Step 2 of {STEPS.length}
        </li>
      </ol>

      {/* Draft summary + placeholder */}
      <section className="animate-pop overflow-hidden rounded-3xl border border-border bg-card shadow-soft [animation-delay:80ms]">
        <div className="flex flex-col gap-1 border-b border-border bg-secondary/30 p-6">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                course.is_public
                  ? "bg-mint/15 text-mint"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {course.is_public ? (
                <Globe className="h-2.5 w-2.5" />
              ) : (
                <Lock className="h-2.5 w-2.5" />
              )}
              {course.is_public ? "Public" : "Private"}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground capitalize">
              {course.status}
            </span>
          </div>
          <h2 className="mt-1 break-words font-display text-xl font-extrabold leading-tight">
            {course.title}
          </h2>
          {course.description && (
            <p className="break-words text-sm text-muted-foreground">
              {course.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ListChecks className="h-6 w-6" />
          </span>
          <h3 className="font-display text-lg font-bold">
            Lesson builder coming next
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            This is where you&apos;ll add and reorder lessons. It isn&apos;t
            built yet — but your draft is already saved to the database.
          </p>
          <Link
            href="/dashboard"
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
