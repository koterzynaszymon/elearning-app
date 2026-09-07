"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentsTabsProps {
  readonly courseId: string;
}

interface TabDef {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  /** Match the pathname exactly rather than by prefix. */
  readonly exact: boolean;
}

export function StudentsTabs({
  courseId,
}: StudentsTabsProps): React.JSX.Element {
  const pathname = usePathname();
  const base = `/dashboard/author-space/${courseId}/students`;

  const tabs: readonly TabDef[] = [
    { href: base, label: "Manage access", icon: UserMinus, exact: true },
    {
      href: `${base}/progress`,
      label: "Track progress",
      icon: LineChart,
      exact: false,
    },
  ];

  return (
    <nav
      aria-label="Student management"
      className="flex flex-wrap items-center gap-1 rounded-full bg-secondary/60 p-1"
    >
      {tabs.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
              active
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
