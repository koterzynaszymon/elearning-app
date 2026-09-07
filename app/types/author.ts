import type { CourseStatus } from "./course";

export type AuthoredCourse = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: CourseStatus;
  readonly isPublic: boolean;
  readonly updatedAt: string;
};

/** One enrolled learner as seen by the course author, with their progress. */
export type CourseRosterEntry = {
  readonly userId: string;
  readonly displayName: string;
  readonly username: string | null;
  readonly email: string | null;
  readonly enrolledAt: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
};
