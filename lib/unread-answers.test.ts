import { describe, expect, it } from "vitest";
import type { CourseQuestion } from "@/app/types/course-questions";
import { isNewAnswerFor, totalUnreadAnswers } from "./unread-answers";

const LEARNER = "learner-1";
const OTHER = "learner-2";

function question(overrides: Partial<CourseQuestion> = {}): CourseQuestion {
  return {
    id: "q1",
    courseId: "c1",
    askedBy: { id: LEARNER, displayName: "Learner" },
    body: "Why?",
    answer: "Because.",
    answeredAt: "2026-10-29T12:00:00.000Z",
    createdAt: "2026-10-28T12:00:00.000Z",
    ...overrides,
  };
}

describe("isNewAnswerFor", () => {
  it("is new when the learner never opened the Q&A", () => {
    expect(isNewAnswerFor(question(), LEARNER, null)).toBe(true);
  });

  it("is new when answered after the last visit", () => {
    expect(isNewAnswerFor(question(), LEARNER, "2026-10-29T11:59:59.000Z")).toBe(true);
  });

  it("is not new when answered before the last visit", () => {
    expect(isNewAnswerFor(question(), LEARNER, "2026-10-29T12:00:01.000Z")).toBe(false);
  });

  it("compares instants, not strings, across timestamp formats", () => {
    expect(isNewAnswerFor(question(), LEARNER, "2026-10-29T13:30:00.123456+02:00")).toBe(true);
  });

  it("ignores unanswered questions", () => {
    expect(isNewAnswerFor(question({ answer: null, answeredAt: null }), LEARNER, null)).toBe(false);
  });

  it("ignores other learners' questions", () => {
    expect(isNewAnswerFor(question(), OTHER, null)).toBe(false);
  });

  it("ignores anonymous viewers", () => {
    expect(isNewAnswerFor(question(), null, null)).toBe(false);
  });
});

describe("totalUnreadAnswers", () => {
  it("sums across courses", () => {
    expect(totalUnreadAnswers({ a: 2, b: 3 })).toBe(5);
  });

  it("is 0 with nothing unread", () => {
    expect(totalUnreadAnswers({})).toBe(0);
  });
});
