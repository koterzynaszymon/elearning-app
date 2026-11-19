import type { EditorRange } from "@/components/ui/rich-text-editor-insert";

export type AiHelpPreset = {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
};

export type AiHelpStatus = "pending" | "done" | "error";

/**
 * One round-trip in the AI helper panel: the text the author highlighted,
 * the instruction they gave, and theanswer that came back.
 */
export type AiHelpEntry = {
  readonly id: string;
  readonly lessonId: string;
  readonly selection: string;
  /** Where `selection` sat in the document when asked; `null` without a highlight. */
  readonly range: EditorRange | null;
  readonly prompt: string;
  readonly createdAt: number;
  readonly status: AiHelpStatus;
  readonly answer: string;
  readonly error: string | null;
};

export type AiHelpRequest = {
  readonly selection: string;
  readonly prompt: string;
  readonly lessonTitle: string;
};

export type AiHelpResult =
  | { readonly success: true; readonly data: string }
  | { readonly success: false; readonly error: string };

export interface LessonAiService {
  requestHelp(request: AiHelpRequest): Promise<AiHelpResult>;
}
