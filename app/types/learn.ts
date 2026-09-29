export type LessonSpineItem = {
  readonly id: string;
  readonly title: string;
  readonly position: number;
  readonly isCompleted: boolean;
};

export type LearnerCourse = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly isPublic: boolean;
  readonly isEnrolled: boolean;
};

export type ReadableLesson = {
  readonly id: string;
  readonly title: string;
  readonly html: string | null;
  readonly position: number;
  readonly isCompleted: boolean;
};

export type CourseRatingSummary = {
  /** Null when the course has no ratings yet. */
  readonly average: number | null;
  readonly count: number;
  /** The current user's own rating, or null if they haven't rated it. */
  readonly myRating: number | null;
};

export type CourseSyllabusView = {
  readonly course: LearnerCourse;
  readonly lessons: readonly LessonSpineItem[];
  readonly ratingSummary: CourseRatingSummary;
};

export type LessonReaderView = {
  readonly course: LearnerCourse;
  readonly lesson: ReadableLesson;
  readonly spine: readonly LessonSpineItem[];
};

export type CompletionState =
  | { readonly kind: "completed" }
  | { readonly kind: "ready" }
  | { readonly kind: "needs-enrollment" };
