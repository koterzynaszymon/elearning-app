export type CourseStatus = "draft" | "published";

export type CourseType = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  password_hash: string | null;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
};

export type CreateCourseInput = {
  title: string;
  description: string | null;
  isPublic: boolean;
  password: string | null;
};

export type UpdateCourseSettingsInput = {
  courseId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  /** New password to set. Omit (or leave null) to keep the existing one. */
  password: string | null;
};
