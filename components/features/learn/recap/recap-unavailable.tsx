import { ArrowDown, Paperclip, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RecapUnavailableProps {
  readonly reason: "attachments-only" | "too-short";
  /** Id of the materials heading, so the notice can link down to the files. */
  readonly materialsAnchor: string;
}

type Copy = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: string;
};

const COPY: Record<RecapUnavailableProps["reason"], Copy> = {
  "attachments-only": {
    icon: Paperclip,
    title: "AI recap isn't available for this lesson",
    body: "Its material lives in the attached files, and the assistant can only read the lesson's text — so it can't summarize it or quiz you on it.",
  },
  "too-short": {
    icon: Type,
    title: "Too short to recap",
    body: "There isn't enough text in this lesson for a useful summary or review questions.",
  },
};

export function RecapUnavailable({
  reason,
  materialsAnchor,
}: RecapUnavailableProps): React.JSX.Element {
  const { icon: Icon, title, body } = COPY[reason];

  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-dashed border-border bg-card/60 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="h-[1.1rem] w-[1.1rem] -rotate-12" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
        {reason === "attachments-only" && (
          <a
            href={`#${materialsAnchor}`}
            className="group mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            Go to the materials
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}
