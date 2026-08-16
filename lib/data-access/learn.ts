"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  CourseSyllabusView,
  LearnerCourse,
  LessonReaderView,
  LessonSpineItem,
} from "@/app/types/learn";

type CourseProgressRow = {
  course_id: string;
  course_title: string;
  description: string | null;
  is_public: boolean;
  is_enrolled: boolean;
  lesson_id: string | null;
  lesson_title: string | null;
  lesson_content: string | null;
  lesson_position: number | null;
  is_completed: boolean | null;
};

type LessonRow = CourseProgressRow & {
  lesson_id: string;
  lesson_title: string;
  lesson_position: number;
};

/** A published course with no lessons yields one row whose lesson columns are null. */
function hasLesson(row: CourseProgressRow): row is LessonRow {
  return (
    row.lesson_id !== null &&
    row.lesson_title !== null &&
    row.lesson_position !== null
  );
}

function toCourse(row: CourseProgressRow): LearnerCourse {
  return {
    id: row.course_id,
    title: row.course_title,
    description: row.description,
    isPublic: row.is_public,
    isEnrolled: row.is_enrolled,
  };
}

function toSpine(rows: readonly LessonRow[]): readonly LessonSpineItem[] {
  return rows.map((row) => ({
    id: row.lesson_id,
    title: row.lesson_title,
    position: row.lesson_position,
    isCompleted: row.is_completed === true,
  }));
}

async function loadCourseProgress(
  courseId: string,
): Promise<readonly CourseProgressRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_course_progress", {
    p_course_id: courseId,
  });

  if (error) {
    console.error(error);
    return [];
  }

  return data as CourseProgressRow[];
}

export async function getCourseSyllabus(
  courseId: string,
): Promise<CourseSyllabusView | null> {
  const rows = await loadCourseProgress(courseId);
  const header = rows[0];
  if (header === undefined) {
    return null;
  }

  return {
    course: toCourse(header),
    lessons: toSpine(rows.filter(hasLesson)),
  };
}

export async function getLessonAtPosition(
  courseId: string,
  position: number,
): Promise<LessonReaderView | null> {
  const rows = await loadCourseProgress(courseId);
  const header = rows[0];
  if (header === undefined) {
    return null;
  }

  const lessons = rows.filter(hasLesson);
  const current = lessons.find((row) => row.lesson_position === position);
  if (current === undefined) {
    return null;
  }

  return {
    course: toCourse(header),
    spine: toSpine(lessons),
    lesson: {
      id: current.lesson_id,
      title: current.lesson_title,
      html: current.lesson_content,
      position: current.lesson_position,
      isCompleted: current.is_completed === true,
    },
  };
}
