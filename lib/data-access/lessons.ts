"use server";

import { createClient } from "@/lib/supabase/server";
import { LessonInput, LessonType } from "@/app/types/lesson";
import { Result } from "@/app/types/profile";

const TITLE_MAX = 100;
const FIRST_ORDER_INDEX = 1;

export async function getLessonsByCourse(
  courseId: string,
): Promise<LessonType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data as LessonType[];
}

/**
 * Replaces the full lesson set for a course in one shot.
 *
 * Destroying and re-creating rows discards lesson ids, which would take any
 * `lesson_completions` rows with them. That is safe only because RLS permits
 * lesson inserts and deletes on drafts alone, and nobody can enroll in a draft —
 * so a course reaching this function has no completions to lose. Payload is
 * validated before the delete so a bad request can never wipe an existing draft.
 */
export async function saveCurriculumDraft(
  courseId: string,
  lessons: readonly LessonInput[],
): Promise<Result<LessonType[]>> {
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
    return { success: false, error: "You cannot edit this course" };
  }

  for (const lesson of lessons) {
    if (lesson.title.trim().length > TITLE_MAX) {
      return {
        success: false,
        error: `Lesson titles must be ${TITLE_MAX} characters or fewer`,
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("lessons")
    .delete()
    .eq("course_id", courseId);
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  if (lessons.length === 0) {
    return { success: true, data: [] };
  }

  const rows = lessons.map((lesson, index) => ({
    course_id: courseId,
    title: lesson.title.trim() || "Untitled lesson",
    content: lesson.content.length > 0 ? lesson.content : null,
    order_index: index + FIRST_ORDER_INDEX,
  }));

  const { data, error } = await supabase.from("lessons").insert(rows).select();
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as LessonType[] };
}
