export type LessonType = {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type LessonInput = {
  id: string;
  title: string;
  content: string;
};
