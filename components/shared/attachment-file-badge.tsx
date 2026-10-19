import { FileArchive, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import {
  ATTACHMENT_MIME_EXTENSIONS,
  isAttachmentMimeType,
} from "@/lib/supabase/lesson-attachments";
import { cn } from "@/lib/utils";

type BadgeTone = {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly className: string;
};

const IMAGE_TONE: BadgeTone = { icon: FileImage, className: "bg-chart-2/15 text-chart-2" };
const SHEET_TONE: BadgeTone = { icon: FileSpreadsheet, className: "bg-mint/15 text-mint" };
const ARCHIVE_TONE: BadgeTone = { icon: FileArchive, className: "bg-chart-4/15 text-chart-4" };
const DOC_TONE: BadgeTone = { icon: FileText, className: "bg-primary/10 text-primary" };

const TONE_BY_EXTENSION: Record<string, BadgeTone> = {
  png: IMAGE_TONE,
  jpg: IMAGE_TONE,
  webp: IMAGE_TONE,
  xlsx: SHEET_TONE,
  csv: SHEET_TONE,
  zip: ARCHIVE_TONE,
};

export function attachmentExtension(fileType: string): string {
  return isAttachmentMimeType(fileType) ? ATTACHMENT_MIME_EXTENSIONS[fileType] : "file";
}

interface AttachmentFileBadgeProps {
  readonly fileType: string;
  readonly className?: string;
}

/** Square file "tile" — icon over a mono extension label, tinted by file family. */
export function AttachmentFileBadge({
  fileType,
  className,
}: AttachmentFileBadgeProps): React.JSX.Element {
  const extension = attachmentExtension(fileType);
  const tone = TONE_BY_EXTENSION[extension] ?? DOC_TONE;
  const Icon = tone.icon;

  return (
    <span
      aria-hidden
      className={cn(
        "flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl",
        tone.className,
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="font-mono text-[0.55rem] font-bold uppercase leading-none tracking-wider">
        {extension}
      </span>
    </span>
  );
}
