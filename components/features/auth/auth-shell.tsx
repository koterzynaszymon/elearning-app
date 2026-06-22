import Link from "next/link";
import { ArrowLeft, GraduationCap, Quote, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";

const PANEL_POINTS: readonly string[] = [
  "Guided lessons that build on each other",
  "An AI tutor a click away from any question",
  "Progress you can actually see",
];

export function AuthShell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — hidden on small screens */}
      <aside className="relative hidden overflow-hidden bg-[hsl(var(--brand-900))] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
        >
          <div className="animate-aurora absolute -left-24 top-1/3 h-[34rem] w-[34rem] rounded-full bg-gradient-to-tr from-primary/50 via-sky-500/30 to-indigo-500/30 blur-3xl" />
        </div>
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 opacity-[0.12]"
        />

        <div className="relative z-10">
          <Logo className="[&_span]:text-white" />
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Learning, illuminated
          </span>
          <h2 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            Where curiosity turns into courses you finish.
          </h2>
          <ul className="mt-8 space-y-3">
            {PANEL_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sky-100/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <GraduationCap className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative z-10 max-w-md">
          <Quote className="h-6 w-6 text-sky-300/70" />
          <blockquote className="mt-2 text-pretty text-sm leading-relaxed text-sky-100/80">
            &ldquo;The platform that finally made me finish a course instead of
            bookmarking it for later.&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-xs text-sky-200/60">
            — A focused learner
          </figcaption>
        </figure>
      </aside>

      {/* Form panel */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <div className="flex items-center gap-2">
            <span className="lg:hidden">
              <Logo showWordmark={false} />
            </span>
            <ThemeSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
