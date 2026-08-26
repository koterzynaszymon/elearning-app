import { cn } from "@/lib/utils";

const STAT_COUNT = 4;
const CARD_COUNT = 3;
const FILTER_COUNT = 3;

function Block({ className }: { readonly className?: string }): React.JSX.Element {
  return (
    <span
      aria-hidden
      className={cn("block rounded-full bg-secondary/70", className)}
    />
  );
}

export function AuthorSpaceSkeleton(): React.JSX.Element {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: STAT_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <Block className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Block className="h-7 w-10" />
              <Block className="h-3 w-20" />
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-1 rounded-full bg-secondary/60 p-1">
        {Array.from({ length: FILTER_COUNT }, (_, index) => (
          <Block key={index} className="h-7 w-24" />
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
          >
            <Block className="h-28 w-full rounded-none" />
            <div className="flex flex-col gap-3 p-5">
              <Block className="h-5 w-4/5" />
              <Block className="h-3 w-full" />
              <Block className="h-3 w-32" />
              <Block className="mt-2 h-10 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
