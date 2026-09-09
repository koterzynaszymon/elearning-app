"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/security/password";
import {
  CourseType,
  CreateCourseInput,
  UpdateCourseSettingsInput,
} from "@/app/types/course";
import { ExploreCourse } from "@/app/types/explore";
import { AuthoredCourse } from "@/app/types/author";
import { Result } from "@/app/types/profile";

type PublishedCatalogueRow = {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  author_name: string;
  lesson_count: number;
  student_count: number;
};

function mapPublishedCourse(row: PublishedCatalogueRow): ExploreCourse {
  return {
    id: row.id,
    title: row.title,
    description: row.description?.trim() ?? "",
    authorName: row.author_name,
    isPublic: row.is_public,
    lessonCount: row.lesson_count,
    studentCount: row.student_count,
    publishedAt: row.updated_at,
  };
}

function mapAuthoredCourse(row: CourseType): AuthoredCourse {
  return {
    id: row.id,
    title: row.title,
    description: row.description?.trim() ?? "",
    status: row.status,
    isPublic: row.is_public,
    updatedAt: row.updated_at,
  };
}

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

export async function getPublishedCourses(): Promise<ExploreCourse[]> {
  const supabase = await createClient();
  // SECURITY DEFINER RPC — see migration published_catalogue.sql.
  // Needed so lesson/student counts are accurate under RLS, without it, RLS blocks for example visibility of student count.
  const { data, error } = await supabase.rpc("get_published_catalogue");

  if (error) {
    console.error(error);
    return [];
  }

  return (data as PublishedCatalogueRow[]).map(mapPublishedCourse);
}

export async function getDraftCoursesByAuthor(): Promise<CourseType[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("author_id", user.id)
    .eq("status", "draft")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data as CourseType[];
}

export async function getCoursesByAuthor(): Promise<AuthoredCourse[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data as CourseType[]).map(mapAuthoredCourse);
}

export async function getCourseByIdForAuthor(
  courseId: string,
): Promise<CourseType | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("author_id", user.id)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data as CourseType;
}

export async function publishCourse(
  courseId: string,
): Promise<Result<CourseType>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("courses")
    .update({ status: "published" })
    .eq("id", courseId)
    .eq("author_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: data as CourseType };
}

/**
 * Updates a course's title, description, and visibility. Switching to
 * private requires a password: pass one to set a new one, or omit it to
 * keep the course's existing password if it already had one.
 */
export async function updateCourseSettings({
  courseId,
  title,
  description,
  isPublic,
  password,
}: UpdateCourseSettingsInput): Promise<Result<CourseType>> {
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

  const { data: existing, error: fetchError } = await supabase
    .from("courses")
    .select("password_hash")
    .eq("id", courseId)
    .eq("author_id", user.id)
    .single();
  if (fetchError || !existing) {
    return { success: false, error: "Course not found" };
  }

  let passwordHash: string | null = existing.password_hash;
  if (isPublic) {
    passwordHash = null;
  } else if (password) {
    if (password.length < PASSWORD_MIN) {
      return {
        success: false,
        error: `A private course needs a password of at least ${PASSWORD_MIN} characters`,
      };
    }
    passwordHash = await hashPassword(password);
  } else if (!passwordHash) {
    return {
      success: false,
      error: `A private course needs a password of at least ${PASSWORD_MIN} characters`,
    };
  }

  const { data, error } = await supabase
    .from("courses")
    .update({
      title,
      description,
      is_public: isPublic,
      password_hash: passwordHash,
    })
    .eq("id", courseId)
    .eq("author_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/author-space/${courseId}`, "layout");
  return { success: true, data: data as CourseType };
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
