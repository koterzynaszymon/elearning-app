import type { CourseProgressStatus, EnrolledCourse } from "@/app/types/my-courses";

const FULL_PROGRESS = 100;

type Progress = Pick<EnrolledCourse, "completedLessons" | "lessonCount">;

export function courseProgressStatus(course: Progress): CourseProgressStatus {
  if (course.completedLessons <= 0) return "not-started";
  if (course.completedLessons >= course.lessonCount) return "completed";
  return "in-progress";
}

export function courseProgressPercent(course: Progress): number {
  if (course.lessonCount <= 0) return 0;
  const ratio =
    Math.min(course.completedLessons, course.lessonCount) / course.lessonCount;
  return Math.round(ratio * FULL_PROGRESS);
}
