import type { AiHelpPreset } from "./types";

/**
 * Quick-start instructions shown as chips under the composer. Selecting one
 * fills the input; the student is free to edit it before sending.
 */
export const AI_HELP_PRESETS: readonly AiHelpPreset[] = [
  {
    id: "explain",
    label: "Explain more",
    prompt:
      "Explain this in more detail, step by step, as if I'm seeing it for the first time.",
  },
  {
    id: "examples",
    label: "Give examples",
    prompt: "Give me one or two concrete examples that illustrate this.",
  },
  {
    id: "facts",
    label: "More facts",
    prompt: "Give me more background facts and context about this.",
  },
  {
    id: "simplify",
    label: "Simplify",
    prompt: "Rephrase this in simpler, more direct language.",
  },
] as const;
