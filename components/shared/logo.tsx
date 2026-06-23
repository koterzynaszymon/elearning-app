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
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-primary-foreground shadow-glow transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <GraduationCap className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight">
            Lumen
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            learn together
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
