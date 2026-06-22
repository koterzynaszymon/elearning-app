import { Logo } from "@/components/shared/logo";

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <Logo />
        <p className="text-xs text-muted-foreground">
          Built as an engineering thesis project
        </p>
      </div>
    </footer>
  );
}
