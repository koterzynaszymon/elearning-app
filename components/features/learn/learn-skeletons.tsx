import { cn } from "@/lib/utils";

const LESSON_PLACEHOLDER_COUNT = 5;
const PARAGRAPH_WIDTHS: readonly string[] = [
  "w-full",
  "w-11/12",
  "w-full",
  "w-4/5",
  "w-full",
  "w-3/5",
];

function Block({ className }: { readonly className?: string }): React.JSX.Element {
  return (
    <span
      aria-hidden
      className={cn("block rounded-full bg-secondary/70", className)}
    />
  );
}

export function SyllabusSkeleton(): React.JSX.Element {
  return (
    <div className="flex animate-pulse flex-col gap-8" aria-busy>
      <div className="flex flex-col gap-3">
        <Block className="h-6 w-24" />
        <Block className="h-11 w-2/3 rounded-2xl" />
        <Block className="h-4 w-1/2" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: LESSON_PLACEHOLDER_COUNT }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <Block className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Block className="h-4 w-3/5" />
                <Block className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Block className="h-16 w-16 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Block className="h-5 w-16" />
              <Block className="h-3 w-24" />
            </div>
          </div>
          <Block className="h-11 w-full rounded-2xl" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function ReaderSkeleton(): React.JSX.Element {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy>
      <Block className="h-4 w-40" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Block className="h-6 w-28" />
            <Block className="h-10 w-3/4 rounded-2xl" />
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {PARAGRAPH_WIDTHS.map((width, index) => (
              <Block key={index} className={cn("h-4", width)} />
            ))}
          </div>
          <Block className="h-16 w-full rounded-3xl" />
        </div>

        <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:p-5">
          <div className="flex items-center gap-3">
            <Block className="h-14 w-14 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Block className="h-4 w-24" />
              <Block className="h-3 w-16" />
            </div>
          </div>
          {Array.from({ length: LESSON_PLACEHOLDER_COUNT }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Block className="h-6 w-6 shrink-0" />
              <Block className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
