import { Check, ListChecks, Rocket, Sparkles, Type } from "lucide-react";
import { CreateCourseForm } from "@/components/features/create-course/create-course-form";
import { cn } from "@/lib/utils";

interface WizardStep {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly state: "current" | "upcoming";
}

const STEPS: readonly WizardStep[] = [
  { label: "Basics", icon: Type, state: "current" },
  { label: "Curriculum", icon: ListChecks, state: "upcoming" },
  { label: "Publish", icon: Rocket, state: "upcoming" },
];

export default function CreateCoursePage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          New course
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Create a <span className="text-gradient-brand">course</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Start with the essentials — you can refine everything before you
          publish.
        </p>
      </header>

      {/* Step indicator */}
      <ol className="animate-pop flex flex-wrap items-center gap-2 [animation-delay:40ms]">
        {STEPS.map(({ label, icon: Icon, state }, i) => {
          const current = state === "current";
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
                    current
                      ? "bg-primary-foreground/20"
                      : "bg-background/60",
                  )}
                >
                  {current ? <Icon className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </div>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="hidden h-px w-6 bg-border sm:block"
                />
              )}
            </li>
          );
        })}
        <li className="ml-1 hidden items-center gap-1 text-xs text-muted-foreground md:flex">
          <Check className="h-3.5 w-3.5" />
          Step 1 of {STEPS.length}
        </li>
      </ol>

      {/* Form */}
      <CreateCourseForm />
    </div>
  );
}
