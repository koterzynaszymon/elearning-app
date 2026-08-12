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
};
