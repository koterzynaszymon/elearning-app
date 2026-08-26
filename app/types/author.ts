import type { CourseStatus } from "./course";

export type AuthoredCourse = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: CourseStatus;
  readonly isPublic: boolean;
  readonly updatedAt: string;
};
