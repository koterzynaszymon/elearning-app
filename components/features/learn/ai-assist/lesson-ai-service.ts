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

type Angle = "explain" | "examples" | "facts" | "simplify" | "general";

function detectAngle(prompt: string): Angle {
  const p = prompt.toLowerCase();
  if (/(explain|detail|elaborate|don't understand|confus|step by step)/.test(p)) return "explain";
  if (/(example|instance|illustrat|show me)/.test(p)) return "examples";
  if (/(fact|background|context|source|reference|more about)/.test(p)) return "facts";
  if (/(simpl|plain|easier|rephrase|shorter)/.test(p)) return "simplify";
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
    explain: hasSelection
      ? `Here's a closer look at the highlighted part of ${lessonRef}.`
      : `A more detailed walkthrough of ${lessonRef}.`,
    examples: hasSelection
      ? `A couple of examples for the highlighted part.`
      : `Some examples that relate to ${lessonRef}.`,
    facts: hasSelection
      ? `Extra background on the highlighted part.`
      : `More context around ${lessonRef}.`,
    simplify: hasSelection
      ? `A plainer version of the highlighted text.`
      : `A simpler way to think about ${lessonRef}.`,
    general: `Notes on your question about ${lessonRef}.`,
  };

  const body: Record<Angle, string[]> = {
    explain: [
      "- Start from the underlying idea before the terminology — the label matters less than the mechanism.",
      "- Here's the missing step that usually gets skipped: work through it slowly once, then the rest follows.",
      "- If a specific word or phrase is still unclear, highlight just that part and ask again.",
    ],
    examples: [
      "- A first example, worked through end to end.",
      "- A second example that changes one detail, so you can see what actually matters and what doesn't.",
      "- Try describing a third case yourself — that's usually the fastest way to tell if it clicked.",
    ],
    facts: [
      "- Some extra context that isn't spelled out in the lesson but helps it make sense.",
      "- A related fact worth knowing, plus where it tends to show up again later.",
      "- One common misconception about this that's worth ruling out early.",
    ],
    simplify: [
      "- Shorter version, one idea per sentence.",
      "- The jargon term, replaced with everyday wording first — the technical term still follows, just second.",
      "- An analogy that maps closely to what's actually happening here.",
    ],
    general: [
      "- Here's how I'd approach answering that.",
      "- Watch out for the part that trips most learners up.",
      "- If you want a more targeted answer, highlight the exact sentence you're stuck on and ask again.",
    ],
  };

  const parts: string[] = [opening[angle]];
  if (quote) parts.push(`\nYou highlighted:\n“${quote}”`);
  parts.push(`\nYour question: ${request.prompt.trim()}`);
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
      return { success: false, error: "Add a question so the assistant knows what to help with." };
    }

    return { success: true, data: buildAnswer(request) };
  }
}

export const lessonAiService: LessonAiService = new MockLessonAiService();
