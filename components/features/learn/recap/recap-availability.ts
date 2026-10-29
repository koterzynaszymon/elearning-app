import { countLessonWords } from "@/lib/security/sanitize-html";
import type { RecapAvailability } from "./types";

/** Below this the model would mostly be padding or guessing. */
export const RECAP_MIN_WORDS = 80;

export function recapAvailabilityOf(
  html: string | null,
  attachmentCount: number,
): RecapAvailability {
  const words = html === null ? 0 : countLessonWords(html);
  const hasAttachments = attachmentCount > 0;

  if (words >= RECAP_MIN_WORDS) return { kind: "available", hasAttachments };
  if (hasAttachments) return { kind: "attachments-only" };
  if (words === 0) return { kind: "empty" };
  return { kind: "too-short" };
}
