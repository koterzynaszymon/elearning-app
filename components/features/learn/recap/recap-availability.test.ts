import { describe, expect, it } from "vitest";
import { RECAP_MIN_WORDS, recapAvailabilityOf } from "./recap-availability";

function lessonOfWords(count: number): string {
  return `<p>${Array.from({ length: count }, () => "word").join(" ")}</p>`;
}

describe("recapAvailabilityOf", () => {
  it("is available at the word threshold", () => {
    expect(recapAvailabilityOf(lessonOfWords(RECAP_MIN_WORDS), 0)).toEqual({
      kind: "available",
      hasAttachments: false,
    });
  });

  it("reports attachments alongside available text", () => {
    expect(recapAvailabilityOf(lessonOfWords(RECAP_MIN_WORDS), 2)).toEqual({
      kind: "available",
      hasAttachments: true,
    });
  });

  it("is too-short just below the threshold", () => {
    expect(recapAvailabilityOf(lessonOfWords(RECAP_MIN_WORDS - 1), 0)).toEqual({ kind: "too-short" });
  });

  it("is attachments-only for short text with files", () => {
    expect(recapAvailabilityOf(lessonOfWords(5), 1)).toEqual({ kind: "attachments-only" });
  });

  it("is empty for null or blank content", () => {
    expect(recapAvailabilityOf(null, 0)).toEqual({ kind: "empty" });
    expect(recapAvailabilityOf("<p></p>", 0)).toEqual({ kind: "empty" });
  });
});
