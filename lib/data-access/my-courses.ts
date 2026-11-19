"use server";

import { createClient } from "@/lib/supabase/server";
import { getUnreadAnswerCounts } from "@/lib/data-access/question-reads";
import type { EnrolledCourse } from "@/app/types/my-courses";
import type { UnreadAnswerCounts } from "@/app/types/course-questions";

type EnrolledCourseRow = {
  course_id: string;
  course_title: string;
  description: string | null;
  author_name: string;
  is_public: boolean;
  lesson_count: number;
  completed_lessons: number;
  enrolled_at: string;
  last_activity_at: string | null;
};

function mapEnrolledCourse(
  row: EnrolledCourseRow,
  unreadAnswers: UnreadAnswerCounts,
): EnrolledCourse {
  return {
    id: row.course_id,
    title: row.course_title,
    description: row.description?.trim() ?? "",
    authorName: row.author_name,
    isPublic: row.is_public,
    lessonCount: row.lesson_count,
    completedLessons: row.completed_lessons,
    enrolledAt: row.enrolled_at,
    lastActivityAt: row.last_activity_at,
    unreadAnswers: unreadAnswers[row.course_id] ?? 0,
  };
}

export async function getEnrolledCourses(): Promise<readonly EnrolledCourse[]> {
  const supabase = await createClient();
  const [{ data, error }, unreadAnswers] = await Promise.all([
    supabase.rpc("get_enrolled_courses"),
    getUnreadAnswerCounts(),
  ]);

  if (error) {
    console.error(error);
    return [];
  }

  return (data as EnrolledCourseRow[]).map((row) =>
    mapEnrolledCourse(row, unreadAnswers),
  );
}
