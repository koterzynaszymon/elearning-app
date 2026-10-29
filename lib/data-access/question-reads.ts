"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UnreadAnswerCounts } from "@/app/types/course-questions";
import type { Result } from "@/app/types/profile";

type UnreadAnswerCountRow = {
  course_id: string;
  unread_count: number;
};

export async function getUnreadAnswerCounts(): Promise<UnreadAnswerCounts> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_unread_answer_counts");

  if (error) {
    console.error(error);
    return {};
  }

  return Object.fromEntries(
    (data as UnreadAnswerCountRow[]).map((row) => [row.course_id, row.unread_count]),
  );
}

export async function getAnswersLastSeenAt(courseId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_question_reads")
    .select("last_seen_at")
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return (data as { last_seen_at: string } | null)?.last_seen_at ?? null;
}

export async function markCourseAnswersSeen(
  courseId: string,
): Promise<Result<{ lastSeenAt: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mark_course_answers_seen", {
    p_course_id: courseId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true, data: { lastSeenAt: data as string } };
}
