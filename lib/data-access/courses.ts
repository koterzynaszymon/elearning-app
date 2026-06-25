"use server";

import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/security/password";
import { CourseType, CreateCourseInput } from "@/app/types/course";
import { Result } from "@/app/types/profile";

const TITLE_MIN = 1;
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 320;
const PASSWORD_MIN = 4;
const SLUG_BASE_MAX = 60;
const SLUG_SUFFIX_BYTES = 3;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_BASE_MAX);
}

function buildSlug(title: string): string {
  const base = slugify(title) || "course";
  const suffix = randomBytes(SLUG_SUFFIX_BYTES).toString("hex");
  return `${base}-${suffix}`;
}

export async function getCourseById(
  courseId: string,
): Promise<CourseType | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data as CourseType;
}

export async function createCourseDraft({
  title,
  description,
  isPublic,
  password,
}: CreateCourseInput): Promise<Result<CourseType>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  title = title.trim();
  description = description?.trim() || null;
  password = password?.trim() || null;

  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    return {
      success: false,
      error: `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters`,
    };
  }
  if (description && description.length > DESCRIPTION_MAX) {
    return {
      success: false,
      error: `Description must be ${DESCRIPTION_MAX} characters or fewer`,
    };
  }
  if (!isPublic && (!password || password.length < PASSWORD_MIN)) {
    return {
      success: false,
      error: `A private course needs a password of at least ${PASSWORD_MIN} characters`,
    };
  }

  const passwordHash =
    isPublic || !password ? null : await hashPassword(password);

  const { data, error } = await supabase
    .from("courses")
    .insert({
      author_id: user.id,
      title,
      slug: buildSlug(title),
      description,
      is_public: isPublic,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as CourseType };
}
