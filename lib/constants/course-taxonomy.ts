import type { CourseCategory, CourseLevel } from "@/app/types/course";

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  programming: "Programming",
  design: "Design",
  business: "Business",
  marketing: "Marketing",
  "personal-development": "Personal development",
  other: "Other",
};

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
