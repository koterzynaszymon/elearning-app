export type CourseProgressStatus = "not-started" | "in-progress" | "completed";

export type EnrolledCourse = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly authorName: string;
  readonly isPublic: boolean;
  readonly lessonCount: number;
  readonly completedLessons: number;
  /** ISO date string — when the learner joined the course. */
  readonly enrolledAt: string;
  /** ISO date string of the last lesson activity, or null if never opened. */
  readonly lastActivityAt: string | null;
};
