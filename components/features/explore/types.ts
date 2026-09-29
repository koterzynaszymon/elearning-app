import type { CourseCategory, CourseLevel } from "@/app/types/course";

export type { ExploreCourse } from "@/app/types/explore";

export type VisibilityFilter = "all" | "public" | "private";

export type SortMode = "newest" | "az" | "popular" | "rating";

export type CategoryFilter = CourseCategory | "all";

export type LevelFilter = CourseLevel | "all";

/** Minimum average rating a course must have, or "all" for no filter. */
export type RatingFilter = "all" | 4 | 3 | 2 | 1;
