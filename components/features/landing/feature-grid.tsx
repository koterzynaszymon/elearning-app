import {
  Brain,
  Library,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function FeatureGrid(): React.JSX.Element {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Why Lumen
        </span>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Everything a course needs, nothing it doesn&apos;t.
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          A focused toolkit for instructors and a calm, motivating space for
          learners — wrapped in a design that gets out of your way.
        </p>
      </div>

      {/* Asymmetric bento grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Wide feature */}
        <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:col-span-2 lg:row-span-2">
          <div className="bg-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400 text-primary-foreground shadow-glow">
              <Brain className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-xl font-semibold">AI study companion</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Stuck on a concept? Ask for a simpler explanation, a worked
              example, or a quick quiz — without ever leaving the lesson. The AI
              layer is built to plug into every course.
            </p>

            <div className="mt-6 space-y-2.5">
              <ChatBubble side="user">Explain Big-O like I&apos;m five.</ChatBubble>
              <ChatBubble side="ai">
                It&apos;s how fast the work grows as the input grows. Doubling the
                list might double the steps — or square them.
              </ChatBubble>
            </div>
          </div>
        </article>

        <FeatureCard
          icon={<Library className="h-5 w-5" />}
          title="Structured courses"
          body="Modules, lessons, and resources organized so learners always know what comes next."
        />
        <FeatureCard
          icon={<LineChart className="h-5 w-5" />}
          title="Visible progress"
          body="Completion tracking and gentle nudges that turn good intentions into finished courses."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Private by design"
          body="Course access is enforced at the database level with row-level security — not just hidden in the UI."
        />
        <FeatureCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Distraction-free"
          body="A calm blue interface tuned for long study sessions, in light or dark."
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}): React.JSX.Element {
  return (
    <article className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

function ChatBubble({
  side,
  children,
}: {
  side: "user" | "ai";
  children: React.ReactNode;
}): React.JSX.Element {
  if (side === "user") {
    return (
      <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
        {children}
      </div>
    );
  }
  return (
    <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-muted/60 px-3.5 py-2 text-sm text-foreground">
      {children}
    </div>
  );
}
