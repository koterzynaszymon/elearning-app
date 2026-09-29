"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CourseRatingSummary } from "@/app/types/learn";
import type { Result } from "@/app/types/profile";

const RATING_MIN = 1;
const RATING_MAX = 5;

function summarize(
  ratings: readonly { rating: number; user_id: string }[],
  currentUserId: string | null,
): CourseRatingSummary {
  const count = ratings.length;
  const average =
    count === 0
      ? null
      : Math.round(
          (ratings.reduce((sum, r) => sum + r.rating, 0) / count) * 100,
        ) / 100;
  const myRating =
    currentUserId === null
      ? null
      : (ratings.find((r) => r.user_id === currentUserId)?.rating ?? null);

  return { average, count, myRating };
}

export async function getCourseRatingSummary(
  courseId: string,
): Promise<CourseRatingSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("course_ratings")
    .select("rating, user_id")
    .eq("course_id", courseId);

  if (error || !data) {
    console.error(error);
    return { average: null, count: 0, myRating: null };
  }

  return summarize(data, user?.id ?? null);
}

/**
 * Sets (or updates) the current user's rating for a course. Requires
 * enrollment — enforced by RLS on course_ratings.
 */
export async function rateCourse(
  courseId: string,
  rating: number,
): Promise<Result<CourseRatingSummary>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  if (
    !Number.isInteger(rating) ||
    rating < RATING_MIN ||
    rating > RATING_MAX
  ) {
    return {
      success: false,
      error: `Rating must be between ${RATING_MIN} and ${RATING_MAX} stars.`,
    };
  }

  const { error } = await supabase.from("course_ratings").upsert(
    { course_id: courseId, user_id: user.id, rating },
    { onConflict: "course_id,user_id" },
  );

  if (error) {
    const isRlsDenied = error.code === "42501";
    return {
      success: false,
      error: isRlsDenied
        ? "You need to be enrolled in this course to rate it."
        : error.message,
    };
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  const summary = await getCourseRatingSummary(courseId);
  return { success: true, data: summary };
}
