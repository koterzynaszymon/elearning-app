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

export type CourseSyllabusView = {
  readonly course: LearnerCourse;
  readonly lessons: readonly LessonSpineItem[];
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
