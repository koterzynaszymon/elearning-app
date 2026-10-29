import { describe, expect, it } from "vitest";
import { courseProgressPercent, courseProgressStatus } from "./course-progress";

describe("courseProgressStatus", () => {
  it("is not-started with no completed lessons", () => {
    expect(courseProgressStatus({ completedLessons: 0, lessonCount: 5 })).toBe("not-started");
  });

  it("is in-progress when some lessons are done", () => {
    expect(courseProgressStatus({ completedLessons: 2, lessonCount: 5 })).toBe("in-progress");
  });

  it("is completed when every lesson is done", () => {
    expect(courseProgressStatus({ completedLessons: 5, lessonCount: 5 })).toBe("completed");
  });

  it("stays completed if lessons were removed after completion", () => {
    expect(courseProgressStatus({ completedLessons: 6, lessonCount: 4 })).toBe("completed");
  });
});

describe("courseProgressPercent", () => {
  it("returns 0 for a course without lessons", () => {
    expect(courseProgressPercent({ completedLessons: 0, lessonCount: 0 })).toBe(0);
  });

  it("rounds to a whole percent", () => {
    expect(courseProgressPercent({ completedLessons: 1, lessonCount: 3 })).toBe(33);
    expect(courseProgressPercent({ completedLessons: 2, lessonCount: 3 })).toBe(67);
  });

  it("never exceeds 100", () => {
    expect(courseProgressPercent({ completedLessons: 9, lessonCount: 4 })).toBe(100);
  });
});
