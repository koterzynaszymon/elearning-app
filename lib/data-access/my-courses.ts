"use server";

import { createClient } from "@/lib/supabase/server";
import type { EnrolledCourse } from "@/app/types/my-courses";

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

function mapEnrolledCourse(row: EnrolledCourseRow): EnrolledCourse {
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
  };
}

export async function getEnrolledCourses(): Promise<readonly EnrolledCourse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_enrolled_courses");

  if (error) {
    console.error(error);
    return [];
  }

  return (data as EnrolledCourseRow[]).map(mapEnrolledCourse);
}
