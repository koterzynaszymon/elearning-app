"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Paperclip, Plus, X } from "lucide-react";
import { AttachmentFileBadge } from "@/components/shared/attachment-file-badge";
import { deleteLessonAttachment } from "@/lib/data-access/lesson-attachments";
import {
  ATTACHMENT_ACCEPT,
  MAX_ATTACHMENTS_PER_LESSON,
  attachmentHref,
  formatFileSize,
} from "@/lib/supabase/lesson-attachments";
import { cn } from "@/lib/utils";
import type { LessonAttachment } from "@/app/types/lesson";
import { uploadLessonAttachment } from "./upload-attachment";

export type AttachmentsUpdater = (
  prev: readonly LessonAttachment[],
) => readonly LessonAttachment[];

interface LessonAttachmentsTrayProps {
  readonly lessonId: string;
  readonly attachments: readonly LessonAttachment[];
  readonly onAttachmentsChange: (lessonId: string, update: AttachmentsUpdater) => void;
  /** Persists the curriculum if this lesson isn't in the database yet. */
  readonly ensureLessonSaved: (lessonId: string) => Promise<boolean>;
}

type TrayState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "removing"; attachmentId: string }
  | { status: "error"; message: string };

const SLOT_INDICES = Array.from({ length: MAX_ATTACHMENTS_PER_LESSON }, (_, i) => i);

export function LessonAttachmentsTray({
  lessonId,
  attachments,
  onAttachmentsChange,
  ensureLessonSaved,
}: LessonAttachmentsTrayProps): React.JSX.Element {
  const [state, setState] = useState<TrayState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = state.status === "uploading" || state.status === "removing";
  const isFull = attachments.length >= MAX_ATTACHMENTS_PER_LESSON;
  const canAdd = !isBusy && !isFull;

  const upload = async (file: File): Promise<void> => {
    if (!canAdd) return;
    setState({ status: "uploading", fileName: file.name });

    const saved = await ensureLessonSaved(lessonId);
    if (!saved) {
      setState({ status: "error", message: "Save the lesson before attaching files." });
      return;
    }

    const result = await uploadLessonAttachment(lessonId, file);
    if (!result.success) {
      setState({ status: "error", message: result.error });
      return;
    }
    onAttachmentsChange(lessonId, (prev) => [...prev, result.data]);
    setState({ status: "idle" });
  };

  const remove = async (attachmentId: string): Promise<void> => {
    if (isBusy) return;
    setState({ status: "removing", attachmentId });
    const result = await deleteLessonAttachment(attachmentId);
    if (!result.success) {
      setState({ status: "error", message: result.error });
      return;
    }
    onAttachmentsChange(lessonId, (prev) => prev.filter((a) => a.id !== attachmentId));
    setState({ status: "idle" });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void upload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void upload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>): void => {
    if (!canAdd) return;
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <section
      aria-label="Lesson materials"
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-3xl border border-border bg-card p-4 shadow-soft transition-colors sm:p-5",
        isDragging && "border-primary/60 bg-primary/5",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 -rotate-6 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Paperclip className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-display text-sm font-extrabold">Lesson materials</h3>
        </div>
        <SlotMeter used={attachments.length} />
      </header>

      <ul className="grid gap-2.5 sm:grid-cols-3">
        {SLOT_INDICES.map((slot) => {
          const attachment = attachments[slot];
          if (attachment) {
            return (
              <FilledSlot
                key={attachment.id}
                attachment={attachment}
                isRemoving={
                  state.status === "removing" && state.attachmentId === attachment.id
                }
                disabled={isBusy}
                onRemove={() => void remove(attachment.id)}
              />
            );
          }
          const isUploadSlot = slot === attachments.length;
          if (isUploadSlot && state.status === "uploading") {
            return <UploadingSlot key={`slot-${slot}`} fileName={state.fileName} />;
          }
          return (
            <EmptySlot
              key={`slot-${slot}`}
              number={slot + 1}
              isNext={isUploadSlot}
              disabled={!canAdd || !isUploadSlot}
              onClick={() => inputRef.current?.click()}
            />
          );
        })}
      </ul>

      <p
        className={cn(
          "mt-3 text-xs",
          state.status === "error"
            ? "font-semibold text-destructive"
            : "text-muted-foreground",
        )}
        role={state.status === "error" ? "alert" : undefined}
      >
        {state.status === "error"
          ? state.message
          : "PDF, Office, text, CSV, ZIP or images · up to 10MB each · drop a file anywhere here"}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={handleInput}
      />
    </section>
  );
}

function SlotMeter({ used }: { readonly used: number }): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${used} of ${MAX_ATTACHMENTS_PER_LESSON} files attached`}
    >
      {SLOT_INDICES.map((slot) => (
        <span
          key={slot}
          className={cn(
            "h-1.5 w-4 rounded-full transition-colors",
            slot < used ? "bg-primary" : "bg-secondary",
          )}
        />
      ))}
      <span className="ml-1.5 text-xs font-bold tabular-nums text-muted-foreground">
        {used}/{MAX_ATTACHMENTS_PER_LESSON}
      </span>
    </div>
  );
}

interface FilledSlotProps {
  readonly attachment: LessonAttachment;
  readonly isRemoving: boolean;
  readonly disabled: boolean;
  readonly onRemove: () => void;
}

function FilledSlot({
  attachment,
  isRemoving,
  disabled,
  onRemove,
}: FilledSlotProps): React.JSX.Element {
  return (
    <li
      className={cn(
        "group relative flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-background/60 p-2.5 pr-9 transition-opacity animate-in fade-in zoom-in-95",
        isRemoving && "opacity-50",
      )}
    >
      <AttachmentFileBadge fileType={attachment.fileType} />
      <a
        href={attachmentHref(attachment.id)}
        className="min-w-0 flex-1 after:absolute after:inset-0 after:rounded-2xl"
        title={`Download ${attachment.fileName}`}
      >
        <p className="truncate text-sm font-bold leading-tight">{attachment.fileName}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Download className="h-3 w-3" />
          {formatFileSize(attachment.fileSize)}
        </p>
      </a>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${attachment.fileName}`}
        title="Remove file"
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isRemoving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </li>
  );
}

function UploadingSlot({ fileName }: { readonly fileName: string }): React.JSX.Element {
  return (
    <li className="flex min-w-0 items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-2.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight">{fileName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Uploading…</p>
      </div>
    </li>
  );
}

interface EmptySlotProps {
  readonly number: number;
  readonly isNext: boolean;
  readonly disabled: boolean;
  readonly onClick: () => void;
}

function EmptySlot({ number, isNext, disabled, onClick }: EmptySlotProps): React.JSX.Element {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex h-full min-h-[4rem] w-full items-center gap-3 rounded-2xl border border-dashed p-2.5 text-left transition-colors",
          isNext
            ? "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
            : "border-border/60 text-muted-foreground/50",
          "disabled:cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold",
            isNext ? "bg-secondary" : "bg-secondary/40",
          )}
        >
          {isNext ? <Plus className="h-4 w-4" /> : number}
        </span>
        <span className="text-xs font-bold">
          {isNext ? "Attach a file" : `Slot ${number}`}
        </span>
      </button>
    </li>
  );
}
