import { redirect } from "next/navigation";
import { Check, ListChecks, Rocket, Sparkles, Type } from "lucide-react";
import { getCourseById } from "@/lib/data-access/courses";
import { PublishPanel } from "@/components/features/create-course/publish/publish-panel";
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

const CURRENT_STEP_INDEX = 2;

interface PublishStepPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function PublishStepPage({
  params,
}: PublishStepPageProps): Promise<React.JSX.Element> {
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
          Final step
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Review &amp; <span className="text-gradient-brand">publish</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          One last look before{" "}
          <span className="font-semibold text-foreground">{course.title}</span>{" "}
          goes out into the world.
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
                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : current ? (
                    <Icon className="h-3 w-3" />
                  ) : (
                    i + 1
                  )}
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
          Step 3 of {STEPS.length}
        </li>
      </ol>

      {/* Publish panel */}
      <div className="animate-pop [animation-delay:80ms]">
        <PublishPanel course={course} />
      </div>
    </div>
  );
}
