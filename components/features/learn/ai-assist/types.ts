export type AiHelpPreset = {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
};

export type AiHelpStatus = "pending" | "done" | "error";

/**
 * One round-trip in the learner helper panel: the text the student
 * highlighted, the instruction they gave, and the answer that came back.
 */
export type AiHelpEntry = {
  readonly id: string;
  readonly lessonId: string;
  /** Empty string means the student asked a general question with no highlight. */
  readonly selection: string;
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
