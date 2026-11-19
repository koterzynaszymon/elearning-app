import { ArrowDownToLine, Paperclip } from "lucide-react";
import { AttachmentFileBadge } from "@/components/shared/attachment-file-badge";
import { attachmentHref, formatFileSize } from "@/lib/supabase/lesson-attachments";
import type { LessonAttachment } from "@/app/types/lesson";

export const LESSON_MATERIALS_HEADING_ID = "lesson-materials-heading";

interface LessonMaterialsProps {
  readonly attachments: readonly LessonAttachment[];
}

/** Downloadable files the author attached to the lesson. Renders nothing when empty. */
export function LessonMaterials({
  attachments,
}: LessonMaterialsProps): React.JSX.Element | null {
  if (attachments.length === 0) return null;

  return (
    <section aria-labelledby={LESSON_MATERIALS_HEADING_ID} className="flex flex-col gap-3">
      <h2
        id={LESSON_MATERIALS_HEADING_ID}
        className="scroll-mt-8 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-muted-foreground"
      >
        <Paperclip className="h-3.5 w-3.5 -rotate-45" />
        Materials
        <span className="h-px flex-1 bg-border" aria-hidden />
      </h2>

      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {attachments.map((attachment, i) => (
          <li
            key={attachment.id}
            className="animate-pop"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <a
              href={attachmentHref(attachment.id)}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 pr-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <AttachmentFileBadge fileType={attachment.fileType} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight">
                  {attachment.fileName}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <ArrowDownToLine className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
