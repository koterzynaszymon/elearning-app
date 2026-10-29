import type {
  LessonRecapService,
  RecapQuestion,
  RecapRequest,
  RecapResult,
} from "./types";

const MIN_DELAY_MS = 900;
const MAX_DELAY_MS = 1800;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function lessonRef(title: string): string {
  return title.trim() ? `“${title.trim()}”` : "this lesson";
}

class MockLessonRecapService implements LessonRecapService {
  async summarize(request: RecapRequest): Promise<RecapResult<string>> {
    await wait(randomDelay());
    const ref = lessonRef(request.lessonTitle);

    return {
      success: true,
      data: [
        `${ref} introduces its central idea and explains why it matters before getting into detail.`,
        "It then breaks the topic into a few smaller parts and walks through each one in order.",
        "Along the way it defines the key terms you will keep seeing in the rest of the course.",
        "A worked example shows how the parts fit together in practice.",
        "The lesson also points out a common mistake and how to avoid it.",
        "This is a placeholder summary — swap the mock in lesson-recap-service.ts for a real model call.",
      ].join(" "),
    };
  }

  async generateQuestions(
    request: RecapRequest,
  ): Promise<RecapResult<readonly RecapQuestion[]>> {
    await wait(randomDelay());
    const ref = lessonRef(request.lessonTitle);

    return {
      success: true,
      data: [
        {
          id: "q1",
          question: `What is the main idea behind ${ref}?`,
          answer:
            "A one- or two-sentence answer grounded in the lesson text. (Placeholder — the real model fills this in.)",
        },
        {
          id: "q2",
          question: "Which key term does the lesson define, and what does it mean?",
          answer:
            "The term, followed by the definition in the lesson's own wording. (Placeholder.)",
        },
        {
          id: "q3",
          question: "What common mistake does the lesson warn about?",
          answer:
            "The mistake, and the reason it happens, as described in the lesson. (Placeholder.)",
        },
      ],
    };
  }
}

export const lessonRecapService: LessonRecapService = new MockLessonRecapService();
