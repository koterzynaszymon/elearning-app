import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS: readonly string[] = [
  "AI study companion",
  "Structured courses",
  "Progress you can see",
];

export function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden">
      {/* Aurora glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="animate-aurora absolute -top-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/30 via-sky-400/20 to-indigo-500/20 blur-3xl" />
      </div>
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="bg-grid mask-radial-fade pointer-events-none absolute inset-0 -z-10 opacity-70"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        {/* Left — copy */}
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Learning, illuminated by AI
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Turn any subject into a{" "}
            <span className="text-gradient-brand">course you finish</span>.
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Lumen is an AI-assisted e-learning platform where instructors build
            beautiful courses and learners stay on track — with guided lessons,
            instant explanations, and progress that actually motivates.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="group h-12 px-6 text-base">
              <Link href="/auth/sign-up">
                Start learning free
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
            >
              <Link href="/auth/login">
                <PlayCircle />
                I already have an account
              </Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — floating lesson mockup */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="animate-float-soft relative rounded-2xl border border-border bg-card p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Foundations of Algorithms</p>
                  <p className="text-xs text-muted-foreground">Module 3 · Recursion</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                In progress
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <ProgressRow label="Lesson 1 · The call stack" value={100} />
              <ProgressRow label="Lesson 2 · Base cases" value={100} />
              <ProgressRow label="Lesson 3 · Recursive thinking" value={62} active />
              <ProgressRow label="Lesson 4 · Memoization" value={0} />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/60 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Course progress</p>
                <p className="text-lg font-semibold">68%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[conic-gradient(hsl(var(--primary))_68%,hsl(var(--muted))_0)] p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-[10px] font-semibold">
                  68
                </div>
              </div>
            </div>
          </div>

          {/* Floating AI hint chip */}
          <div className="animate-float-soft absolute -bottom-6 -left-6 hidden max-w-[15rem] rounded-xl border border-border bg-card/90 p-3 shadow-glow backdrop-blur sm:block [animation-delay:1.5s]">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">AI tutor:</span>{" "}
                Think of recursion as a problem that solves a smaller version of
                itself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressRow({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number;
  active?: boolean;
}): React.JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span
          className={
            active
              ? "text-xs font-medium text-foreground"
              : "text-xs text-muted-foreground"
          }
        >
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {value}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
