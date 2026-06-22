import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}

export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: LogoProps): React.JSX.Element {
  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400 text-primary-foreground shadow-glow transition-transform duration-300 group-hover:-rotate-6">
        <GraduationCap className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight">
            Lumen
            <span className="text-primary">.</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Learn
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Lumen — home">
      {content}
    </Link>
  );
}
