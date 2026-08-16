"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Result } from "@/app/types/profile";

const FOREIGN_KEY_VIOLATION = "23503";
const RLS_VIOLATION = "42501";

function completionError(code: string | undefined): string {
  if (code === FOREIGN_KEY_VIOLATION) {
    return "That lesson no longer exists";
  }
  if (code === RLS_VIOLATION) {
    return "Join this course to track your progress";
  }
  return "Could not save your progress — please try again";
}

export async function markLessonCompleted(
  lessonId: string,
): Promise<Result<{ lessonId: string }>> {
  if (lessonId.trim().length === 0) {
    return { success: false, error: "Missing lesson id" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const { error } = await supabase.from("lesson_completions").upsert(
    { user_id: user.id, lesson_id: lessonId },
    { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error(error);
    return { success: false, error: completionError(error.code) };
  }

  // "layout" covers the syllabus and every lesson beneath it in one call.
  revalidatePath("/dashboard/courses", "layout");
  revalidatePath("/dashboard");

  return { success: true, data: { lessonId } };
}
