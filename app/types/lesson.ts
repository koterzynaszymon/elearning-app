export type LessonType = {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type LessonAttachment = {
  readonly id: string;
  readonly lessonId: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly fileSize: number;
  readonly uploadedAt: string;
};

export type AttachmentUploadTicket = {
  readonly path: string;
  readonly token: string;
};

export type LessonInput = {
  id: string;
  title: string;
  content: string;
};
