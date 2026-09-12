import type { AiHelpPreset } from "./types";

/**
 * Quick-start instructions shown as chips under the composer. Selecting one
 * fills the input; the author is free to edit it before sending.
 */
export const AI_HELP_PRESETS: readonly AiHelpPreset[] = [
  {
    id: "verify",
    label: "Check accuracy",
    prompt:
      "Check whether this information is correct and flag anything misleading, outdated, or missing important context.",
  },
  {
    id: "expand",
    label: "Add detail",
    prompt:
      "Expand this with more detail and one concrete example a learner would find useful. Keep the tone consistent with the rest of the lesson.",
  },
  {
    id: "simplify",
    label: "Simplify",
    prompt:
      "Rewrite this in plainer language for a beginner without losing the meaning.",
  },
  {
    id: "grammar",
    label: "Fix grammar",
    prompt: "Fix any grammar, spelling, and punctuation problems and return the polished text.",
  },
] as const;
