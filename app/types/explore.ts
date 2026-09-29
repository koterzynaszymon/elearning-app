import type { CourseCategory, CourseLevel } from "@/app/types/course";

export type ExploreCourse = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly authorName: string;
  readonly isPublic: boolean;
  readonly lessonCount: number;
  readonly studentCount: number;
  /** ISO date string — used for the "Newest" sort. */
  readonly publishedAt: string;
  readonly category: CourseCategory;
  readonly level: CourseLevel;
  /** Null when the course has no ratings yet. */
  readonly averageRating: number | null;
  readonly ratingCount: number;
};
