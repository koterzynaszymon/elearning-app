"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CourseRosterEntry } from "@/app/types/author";
import type { Result } from "@/app/types/profile";

type RosterRow = {
  user_id: string;
  display_name: string;
  username: string | null;
  email: string | null;
  enrolled_at: string;
  completed_lessons: number;
  total_lessons: number;
};

function mapRosterRow(row: RosterRow): CourseRosterEntry {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    username: row.username,
    email: row.email,
    enrolledAt: row.enrolled_at,
    completedLessons: row.completed_lessons,
    totalLessons: row.total_lessons,
  };
}

/**
 * The learners enrolled in a course, newest first, with per-learner completion
 * counts. Returns an empty list for anyone who is not the course's author — the
 * `get_course_roster` RPC enforces ownership.
 */
export async function getCourseRoster(
  courseId: string,
): Promise<CourseRosterEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_course_roster", {
    p_course_id: courseId,
  });

  if (error) {
    console.error(error);
    return [];
  }

  return (data as RosterRow[]).map(mapRosterRow);
}

/**
 * Removes a learner from a course the caller owns. Their `lesson_completions`
 * rows are left untouched, so re-enrolling restores their progress.
 */
export async function removeStudentFromCourse(
  courseId: string,
  studentId: string,
): Promise<Result<{ studentId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, author_id")
    .eq("id", courseId)
    .single();
  if (courseError || !course) {
    return { success: false, error: "Course not found" };
  }
  if (course.author_id !== user.id) {
    return { success: false, error: "You do not own this course" };
  }

  const { error: deleteError } = await supabase
    .from("enrollments")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", studentId);
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath(`/dashboard/author-space/${courseId}/students`, "layout");
  return { success: true, data: { studentId } };
}
