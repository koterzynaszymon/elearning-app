import { Logo } from "@/components/shared/logo";

const NAV_PLACEHOLDER_COUNT = 4;

export function SidebarFallback(): React.JSX.Element {
  return (
    <>
      <div className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 px-4 lg:hidden">
        <Logo />
      </div>

      <aside
        aria-hidden
        className="sticky top-0 hidden h-svh w-[17rem] shrink-0 animate-pulse border-r border-border bg-card/40 px-4 py-5 lg:flex lg:flex-col"
      >
        <div className="px-2">
          <Logo />
        </div>
        <div className="mt-7 flex flex-col gap-1.5">
          {Array.from({ length: NAV_PLACEHOLDER_COUNT }, (_, index) => (
            <span
              key={index}
              className="h-10 rounded-2xl bg-secondary/60"
            />
          ))}
        </div>
        <div className="mt-auto h-[7.5rem] rounded-2xl border border-border bg-secondary/40" />
      </aside>
    </>
  );
}
