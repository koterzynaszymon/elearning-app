"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CourseQuestion } from "@/app/types/course-questions";
import type { Result } from "@/app/types/profile";

const BODY_MAX = 500;
const ANSWER_MAX = 2000;

const QUESTION_SELECT =
  "id, course_id, user_id, body, answer, answered_at, created_at, profiles(username, first_name, last_name)";

type QuestionRow = {
  id: string;
  course_id: string;
  user_id: string;
  body: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  profiles: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

function displayNameOf(profile: QuestionRow["profiles"]): string {
  if (profile === null) {
    return "Unknown learner";
  }
  const full = [profile.first_name, profile.last_name]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");
  return full || profile.username || "Unknown learner";
}

function mapQuestion(row: QuestionRow): CourseQuestion {
  return {
    id: row.id,
    courseId: row.course_id,
    askedBy: { id: row.user_id, displayName: displayNameOf(row.profiles) },
    body: row.body,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
  };
}

/**
 * All questions for a course, newest first. RLS limits this to enrolled
 * learners, the course's author, and admins — anyone else gets an empty list.
 */
export async function getCourseQuestions(
  courseId: string,
): Promise<CourseQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_questions")
    .select(QUESTION_SELECT)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data as unknown as QuestionRow[]).map(mapQuestion);
}

export async function askCourseQuestion(
  courseId: string,
  body: string,
): Promise<Result<CourseQuestion>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Write a question before sending it." };
  }
  if (trimmed.length > BODY_MAX) {
    return {
      success: false,
      error: `Questions must be ${BODY_MAX} characters or fewer.`,
    };
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("user_id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (enrollmentError || !enrollment) {
    return {
      success: false,
      error: "You need to be enrolled in this course to ask a question.",
    };
  }

  const { data, error } = await supabase
    .from("course_questions")
    .insert({ course_id: courseId, user_id: user.id, body: trimmed })
    .select(QUESTION_SELECT)
    .single();
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/courses/${courseId}/questions`);
  return { success: true, data: mapQuestion(data as unknown as QuestionRow) };
}

/**
 * Sets (or edits) the answer on a question.
 */
export async function answerCourseQuestion(
  questionId: string,
  answer: string,
): Promise<Result<CourseQuestion>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const trimmed = answer.trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Write an answer before sending it." };
  }
  if (trimmed.length > ANSWER_MAX) {
    return {
      success: false,
      error: `Answers must be ${ANSWER_MAX} characters or fewer.`,
    };
  }

  const { data: question, error: questionError } = await supabase
    .from("course_questions")
    .select("id, course_id, courses(author_id)")
    .eq("id", questionId)
    .single();
  if (questionError || !question) {
    return { success: false, error: "Question not found" };
  }
  const course = question.courses as unknown as { author_id: string } | null;
  if (course === null || course.author_id !== user.id) {
    return { success: false, error: "You do not own this course" };
  }

  const { data, error } = await supabase
    .from("course_questions")
    .update({ answer: trimmed, answered_at: new Date().toISOString() })
    .eq("id", questionId)
    .select(QUESTION_SELECT)
    .single();
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/courses/${question.course_id}/questions`);
  revalidatePath(`/dashboard/author-space/${question.course_id}/questions`);
  return { success: true, data: mapQuestion(data as unknown as QuestionRow) };
}

/**
 * Removes a question. Allowed for the learner who asked it or the course's
 * author (moderation) — anyone else is rejected here before RLS is even hit.
 */
export async function deleteCourseQuestion(
  questionId: string,
): Promise<Result<{ questionId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const { data: question, error: questionError } = await supabase
    .from("course_questions")
    .select("id, course_id, user_id, courses(author_id)")
    .eq("id", questionId)
    .single();
  if (questionError || !question) {
    return { success: false, error: "Question not found" };
  }
  const course = question.courses as unknown as { author_id: string } | null;
  const isAsker = question.user_id === user.id;
  const isOwner = course !== null && course.author_id === user.id;
  if (!isAsker && !isOwner) {
    return { success: false, error: "You cannot delete this question" };
  }

  const { error } = await supabase
    .from("course_questions")
    .delete()
    .eq("id", questionId);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/courses/${question.course_id}/questions`);
  revalidatePath(`/dashboard/author-space/${question.course_id}/questions`);
  return { success: true, data: { questionId } };
}
