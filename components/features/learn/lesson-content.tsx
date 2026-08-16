import { FileText } from "lucide-react";
import { isBlankLessonHtml, sanitizeLessonHtml } from "@/lib/security/sanitize-html";

interface LessonContentProps {
  readonly html: string | null;
}

export function LessonContent({ html }: LessonContentProps): React.JSX.Element {
  if (html === null || isBlankLessonHtml(html)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <FileText className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-lg font-extrabold">
            Nothing written here yet
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            The instructor hasn&apos;t added content to this lesson. You can
            still mark it complete and move on.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="lesson-prose"
      dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(html) }}
    />
  );
}
