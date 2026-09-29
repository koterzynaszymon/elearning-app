export type CourseStatus = "draft" | "published";

export const COURSE_CATEGORIES = [
  "programming",
  "design",
  "business",
  "marketing",
  "personal-development",
  "other",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export type CourseType = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  password_hash: string | null;
  status: CourseStatus;
  category: CourseCategory;
  level: CourseLevel;
  created_at: string;
  updated_at: string;
};

export type CreateCourseInput = {
  title: string;
  description: string | null;
  isPublic: boolean;
  password: string | null;
  category: CourseCategory;
  level: CourseLevel;
};

export type UpdateCourseSettingsInput = {
  courseId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  /** New password to set. Omit (or leave null) to keep the existing one. */
  password: string | null;
  category: CourseCategory;
  level: CourseLevel;
};
