"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/security/password";
import { Result } from "@/app/types/profile";

export async function getEnrolledCourseIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((row) => row.course_id as string);
}

export async function enrollInCourse(
  courseId: string,
  password: string | null = null,
): Promise<Result<{ courseId: string }>> {
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
    .select("id, status, is_public, password_hash, author_id")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return { success: false, error: "Course not found" };
  }
  if (course.status !== "published") {
    return { success: false, error: "This course is not published yet" };
  }
  if (course.author_id === user.id) {
    return {
      success: false,
      error: "You already own this course — no need to join it",
    };
  }

  if (!course.is_public) {
    if (!password || password.trim().length === 0) {
      return { success: false, error: "This course requires a password" };
    }
    if (!course.password_hash) {
      return { success: false, error: "This course is not joinable right now" };
    }
    const ok = await verifyPassword(password, course.password_hash);
    if (!ok) {
      return { success: false, error: "Incorrect password" };
    }
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return { success: true, data: { courseId } };
  }

  const { error: insertError } = await supabase.from("enrollments").insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, data: { courseId } };
}
