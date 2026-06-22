import Link from "next/link";
import { ArrowRight, UserPlus, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create your account",
    body: "Sign up in seconds as a learner or an instructor — one space for both.",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Open a course",
    body: "Follow structured modules and ask the AI tutor whenever something is unclear.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Finish what you start",
    body: "Watch your progress fill up and complete courses you actually care about.",
  },
] as const;

export function HowItWorks(): React.JSX.Element {
  return (
    <section id="how" className="relative mx-auto max-w-6xl px-5 py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            From sign-up to finished, in three steps.
          </h2>
        </div>
        <Button asChild size="lg" className="group h-12 shrink-0 px-6 text-base">
          <Link href="/auth/sign-up">
            Create your free account
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Connected stepper */}
      <ol className="relative mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
        {/* Connector line (desktop) */}
        <span
          aria-hidden
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 sm:block"
        />

        {STEPS.map(({ icon: Icon, step, title, body }, index) => (
          <li key={step} className="relative flex gap-4 sm:flex-col sm:gap-0">
            {/* Vertical connector (mobile) */}
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute left-7 top-14 h-[calc(100%+2.5rem-3.5rem)] w-px bg-gradient-to-b from-primary/40 to-transparent sm:hidden"
              />
            )}

            {/* Node */}
            <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-glow">
              <Icon className="h-6 w-6 text-primary" />
              <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-400 text-[11px] font-bold text-primary-foreground">
                {step.replace("0", "")}
              </span>
            </div>

            <div className="sm:mt-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
