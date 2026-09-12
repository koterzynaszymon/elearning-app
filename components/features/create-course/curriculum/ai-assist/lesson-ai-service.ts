import type { AiHelpRequest, AiHelpResult, LessonAiService } from "./types";

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1500;
const SELECTION_ECHO_LIMIT = 220;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function truncate(text: string, limit: number): string {
  const trimmed = text.trim();
  return trimmed.length > limit ? `${trimmed.slice(0, limit).trimEnd()}…` : trimmed;
}

type Angle = "verify" | "expand" | "simplify" | "grammar" | "general";

function detectAngle(prompt: string): Angle {
  const p = prompt.toLowerCase();
  if (/(correct|accurate|accuracy|true|verify|fact|check)/.test(p)) return "verify";
  if (/(expand|more detail|elaborate|example|add)/.test(p)) return "expand";
  if (/(simplify|simpler|beginner|plain|easier)/.test(p)) return "simplify";
  if (/(grammar|spelling|punctuation|typo|proofread|polish)/.test(p)) return "grammar";
  return "general";
}

function buildAnswer(request: AiHelpRequest): string {
  const angle = detectAngle(request.prompt);
  const hasSelection = request.selection.trim().length > 0;
  const quote = hasSelection ? truncate(request.selection, SELECTION_ECHO_LIMIT) : "";
  const lessonRef = request.lessonTitle.trim()
    ? `“${request.lessonTitle.trim()}”`
    : "this lesson";

  const opening: Record<Angle, string> = {
    verify: hasSelection
      ? `Accuracy check on the highlighted passage in ${lessonRef}.`
      : `Accuracy notes for ${lessonRef}.`,
    expand: hasSelection
      ? `Here is a fuller version of the highlighted passage.`
      : `Some directions you could expand ${lessonRef} in.`,
    simplify: hasSelection
      ? `A plainer rewrite of the highlighted passage.`
      : `Ways to make ${lessonRef} easier to follow.`,
    grammar: hasSelection
      ? `A cleaned-up version of the highlighted text.`
      : `Language pass over ${lessonRef}.`,
    general: `Notes on your question about ${lessonRef}.`,
  };

  const body: Record<Angle, string[]> = {
    verify: [
      "- The core claim reads as broadly correct, but it is stated more absolutely than the evidence usually supports — consider softening it with a qualifier.",
      "- One date / figure here is worth double-checking against a primary source before publishing.",
      "- Add a sentence of context so a learner understands *why* this matters, not just that it is true.",
    ],
    expand: [
      "- Lead with the one-sentence takeaway, then unpack it.",
      "- Add a short worked example so the idea lands concretely.",
      "- Close with a common mistake learners make here, so they can avoid it.",
    ],
    simplify: [
      "- Break the long sentence into two shorter ones.",
      "- Replace the jargon term with everyday wording, then introduce the technical term in parentheses.",
      "- Use an analogy the reader already understands.",
    ],
    grammar: [
      "- Tighten the phrasing and fix the run-on sentence.",
      "- Make the verb tense consistent across the paragraph.",
      "- Keep terminology capitalised the same way throughout.",
    ],
    general: [
      "- Here is how I would approach it, step by step.",
      "- Watch out for the edge case that trips most learners up.",
      "- If you want, highlight a specific sentence and ask again for a more targeted answer.",
    ],
  };

  const parts: string[] = [opening[angle]];
  if (quote) parts.push(`\nYou highlighted:\n“${quote}”`);
  parts.push(`\nYour instruction: ${request.prompt.trim()}`);
  parts.push(`\n${body[angle].join("\n")}`);
  parts.push(
    "\n— This is a placeholder response. Swap the mock in lesson-ai-service.ts for a real model call to make it live.",
  );
  return parts.join("\n");
}

class MockLessonAiService implements LessonAiService {
  async requestHelp(request: AiHelpRequest): Promise<AiHelpResult> {
    await wait(randomDelay());

    if (request.prompt.trim().length === 0) {
      return { success: false, error: "Add an instruction so the assistant knows what to do." };
    }

    return { success: true, data: buildAnswer(request) };
  }
}

export const lessonAiService: LessonAiService = new MockLessonAiService();
