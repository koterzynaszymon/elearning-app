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
