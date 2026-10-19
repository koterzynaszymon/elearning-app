"use server";

import { createClient } from "@/lib/supabase/server";
import { LessonInput, LessonType } from "@/app/types/lesson";
import { Result } from "@/app/types/profile";
import {
  getAttachmentPathsForLessons,
  removeAttachmentObjects,
} from "@/lib/data-access/attachment-storage";

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

function validateLessonTitles(lessons: readonly LessonInput[]): string | null {
  for (const lesson of lessons) {
    if (lesson.title.trim().length > TITLE_MAX) {
      return `Lesson titles must be ${TITLE_MAX} characters or fewer`;
    }
  }
  return null;
}

async function getOwnedCourse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  userId: string,
): Promise<Result<{ id: string; status: string }>> {
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, author_id, status")
    .eq("id", courseId)
    .single();
  if (error || !course) {
    return { success: false, error: "Course not found" };
  }
  if (course.author_id !== userId) {
    return { success: false, error: "You cannot edit this course" };
  }
  return { success: true, data: course };
}

/**
 * Deletes the given lessons (cascading their attachment rows), then removes
 * the attachments' Storage objects, which no FK cascade can reach.
 */
async function deleteLessonsWithAttachments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  lessonIds: readonly string[],
): Promise<Result<null>> {
  if (lessonIds.length === 0) {
    return { success: true, data: null };
  }

  const attachmentPaths = await getAttachmentPathsForLessons(supabase, lessonIds);

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("course_id", courseId)
    .in("id", lessonIds);
  if (error) {
    return { success: false, error: error.message };
  }

  await removeAttachmentObjects(supabase, attachmentPaths);
  return { success: true, data: null };
}

/**
 * Syncs a draft course's lessons to exactly the submitted list and order.
 *
 * Lesson ids are preserved, so attachments survive a save. Existing lessons
 * are re-indexed in a single upsert statement: `lessons_course_order_unique`
 * is DEFERRABLE INITIALLY DEFERRED, so swapped positions are only checked at
 * commit. Reordering is only allowed here because nobody can enroll in a
 * draft; once published, use `saveLiveCurriculum`.
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

  const course = await getOwnedCourse(supabase, courseId, user.id);
  if (!course.success) {
    return course;
  }

  const titleError = validateLessonTitles(lessons);
  if (titleError !== null) {
    return { success: false, error: titleError };
  }

  const { data: existingLessons, error: existingError } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);
  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const existingIds = new Set(existingLessons.map((lesson) => lesson.id));
  const submittedIds = new Set(lessons.map((lesson) => lesson.id));

  const removed = await deleteLessonsWithAttachments(
    supabase,
    courseId,
    [...existingIds].filter((id) => !submittedIds.has(id)),
  );
  if (!removed.success) {
    return removed;
  }

  const rows = lessons.map((lesson, index) => ({
    id: lesson.id,
    course_id: courseId,
    title: lesson.title.trim() || "Untitled lesson",
    content: lesson.content.length > 0 ? lesson.content : null,
    order_index: index + FIRST_ORDER_INDEX,
  }));
  // Kept lessons are upserted; new ones go through a plain insert so a
  // submitted id can never hijack a lesson from another course.
  const kept = rows.filter((row) => existingIds.has(row.id));
  const added = rows.filter((row) => !existingIds.has(row.id));

  if (kept.length > 0) {
    const { error } = await supabase
      .from("lessons")
      .upsert(kept, { onConflict: "id" });
    if (error) {
      return { success: false, error: error.message };
    }
  }

  if (added.length > 0) {
    const { error } = await supabase.from("lessons").insert(added);
    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, data: await getLessonsByCourse(courseId) };
}

/**
 * Applies additions/edits/removals to a published course's lessons without
 * touching any existing lesson's order_index — reordering stays frozen, and
 * every lesson id an existing `lesson_completions` row might reference is
 * preserved unless the author explicitly removed that lesson. New lessons are
 * appended after the current highest order_index.
 */
export async function saveLiveCurriculum(
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

  const course = await getOwnedCourse(supabase, courseId, user.id);
  if (!course.success) {
    return course;
  }

  const titleError = validateLessonTitles(lessons);
  if (titleError !== null) {
    return { success: false, error: titleError };
  }

  const { data: existingLessons, error: existingError } = await supabase
    .from("lessons")
    .select("id, order_index")
    .eq("course_id", courseId);
  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const existingOrderById = new Map(
    existingLessons.map((lesson) => [lesson.id, lesson.order_index]),
  );

  const submittedIds = new Set(lessons.map((lesson) => lesson.id));
  const toDeleteIds = existingLessons
    .map((lesson) => lesson.id)
    .filter((id) => !submittedIds.has(id));

  const removed = await deleteLessonsWithAttachments(supabase, courseId, toDeleteIds);
  if (!removed.success) {
    return removed;
  }

  let nextOrderIndex =
    Math.max(FIRST_ORDER_INDEX - 1, ...existingLessons.map((l) => l.order_index)) + 1;

  const toInsert: Array<{
    id: string;
    course_id: string;
    title: string;
    content: string | null;
    order_index: number;
  }> = [];
  const toUpdate: Array<{
    id: string;
    title: string;
    content: string | null;
  }> = [];

  for (const lesson of lessons) {
    const existingOrderIndex = existingOrderById.get(lesson.id);
    const lessonData = {
      title: lesson.title.trim() || "Untitled lesson",
      content: lesson.content.length > 0 ? lesson.content : null,
    };

    if (existingOrderIndex !== undefined) {
      toUpdate.push({ id: lesson.id, ...lessonData });
    } else {
      toInsert.push({
        id: lesson.id,
        course_id: courseId,
        order_index: nextOrderIndex++,
        ...lessonData,
      });
    }
  }

  const allData: LessonType[] = [];

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from("lessons")
      .insert(toInsert)
      .select();
    if (error) {
      return { success: false, error: error.message };
    }
    allData.push(...(data as LessonType[]));
  }

  if (toUpdate.length > 0) {
    for (const update of toUpdate) {
      const { data, error } = await supabase
        .from("lessons")
        .update({ title: update.title, content: update.content })
        .eq("id", update.id)
        .select()
        .single();
      if (error) {
        return { success: false, error: error.message };
      }
      if (data) {
        allData.push(data as LessonType);
      }
    }
  }

  if (allData.length === 0 && lessons.length === 0) {
    return { success: true, data: [] };
  }

  return { success: true, data: allData };
}
