export type RecapQuestion = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
};

export type RecapRequest = {
  /** The server resolves the lesson text from the id — the client never sends it. */
  readonly lessonId: string;
  readonly lessonTitle: string;
};

export type RecapResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

export interface LessonRecapService {
  summarize(request: RecapRequest): Promise<RecapResult<string>>;
  generateQuestions(
    request: RecapRequest,
  ): Promise<RecapResult<readonly RecapQuestion[]>>;
}

export type RecapAvailability =
  | { readonly kind: "available"; readonly hasAttachments: boolean }
  | { readonly kind: "attachments-only" }
  | { readonly kind: "too-short" }
  | { readonly kind: "empty" };

export type RecapRequestState<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: string }
  | { readonly status: "done"; readonly data: T };
