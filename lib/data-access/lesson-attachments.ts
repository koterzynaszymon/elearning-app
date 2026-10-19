"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ATTACHMENT_DOWNLOAD_TTL_SECONDS,
  LESSON_ATTACHMENTS_BUCKET,
  MAX_ATTACHMENTS_PER_LESSON,
  attachmentObjectPath,
  isAttachmentMimeType,
  isUuid,
  isValidAttachmentPath,
  sanitizeAttachmentFileName,
  validateAttachmentFile,
  type AttachmentFileMeta,
} from "@/lib/supabase/lesson-attachments";
import type { AttachmentUploadTicket, LessonAttachment } from "@/app/types/lesson";
import type { Result } from "@/app/types/profile";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type AttachmentRow = {
  id: string;
  lesson_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
};

const ATTACHMENT_COLUMNS =
  "id, lesson_id, file_name, file_type, file_size, storage_path, uploaded_at";

function toAttachment(row: AttachmentRow): LessonAttachment {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    uploadedAt: row.uploaded_at,
  };
}

/** Resolves the lesson's course and checks the signed-in user authors it. */
async function getAuthoredLessonCourseId(
  supabase: ServerClient,
  lessonId: string,
): Promise<Result<string>> {
  if (!isUuid(lessonId)) {
    return { success: false, error: "Lesson not found" };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("course_id, courses!inner(author_id)")
    .eq("id", lessonId)
    .single();
  if (error || !data) {
    return { success: false, error: "Save the lesson before attaching files" };
  }

  const row = data as unknown as { course_id: string; courses: { author_id: string } };
  if (row.courses.author_id !== user.id) {
    return { success: false, error: "You cannot edit this lesson" };
  }
  return { success: true, data: row.course_id };
}

async function countLessonAttachments(
  supabase: ServerClient,
  lessonId: string,
): Promise<Result<number>> {
  const { count, error } = await supabase
    .from("lesson_attachments")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", lessonId);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data: count ?? 0 };
}

export async function getLessonAttachments(
  lessonId: string,
): Promise<LessonAttachment[]> {
  const byLesson = await getAttachmentsByLessonIds([lessonId]);
  return byLesson[lessonId] ?? [];
}

export async function getAttachmentsByLessonIds(
  lessonIds: readonly string[],
): Promise<Record<string, LessonAttachment[]>> {
  const ids = lessonIds.filter(isUuid);
  if (ids.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_attachments")
    .select(ATTACHMENT_COLUMNS)
    .in("lesson_id", ids)
    .order("uploaded_at", { ascending: true });
  if (error) {
    console.error(error);
    return {};
  }

  const grouped: Record<string, LessonAttachment[]> = {};
  for (const row of data as AttachmentRow[]) {
    (grouped[row.lesson_id] ??= []).push(toAttachment(row));
  }
  return grouped;
}

/**
 * Step 1 of an upload. The server — never the client — chooses the object
 * path, then hands back a one-time signed upload token for exactly that path.
 * The file goes straight from the browser to Storage, so it never has to fit
 * through the Server Action body limit.
 */
export async function createAttachmentUpload(
  lessonId: string,
  file: AttachmentFileMeta,
): Promise<Result<AttachmentUploadTicket>> {
  const validationError = validateAttachmentFile(file);
  if (validationError !== null || !isAttachmentMimeType(file.type)) {
    return { success: false, error: validationError ?? "Unsupported file type" };
  }

  const supabase = await createClient();
  const courseId = await getAuthoredLessonCourseId(supabase, lessonId);
  if (!courseId.success) return courseId;

  const count = await countLessonAttachments(supabase, lessonId);
  if (!count.success) return count;
  if (count.data >= MAX_ATTACHMENTS_PER_LESSON) {
    return {
      success: false,
      error: `A lesson can have at most ${MAX_ATTACHMENTS_PER_LESSON} files`,
    };
  }

  const path = attachmentObjectPath(
    courseId.data,
    lessonId,
    crypto.randomUUID(),
    file.type,
  );
  const { data, error } = await supabase.storage
    .from(LESSON_ATTACHMENTS_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { success: false, error: "Could not prepare the upload" };
  }
  return { success: true, data: { path: data.path, token: data.token } };
}

/**
 * Step 2 of an upload. Trusts nothing the client says about the file except
 * its display name: the path must be one we could have issued for this
 * lesson, and size/type are read back from the stored object.
 */
export async function confirmAttachmentUpload(
  lessonId: string,
  path: string,
  fileName: string,
): Promise<Result<LessonAttachment>> {
  const supabase = await createClient();
  const courseId = await getAuthoredLessonCourseId(supabase, lessonId);
  if (!courseId.success) return courseId;

  if (!isValidAttachmentPath(path, courseId.data, lessonId)) {
    return { success: false, error: "Invalid attachment path" };
  }

  const bucket = supabase.storage.from(LESSON_ATTACHMENTS_BUCKET);
  const { data: info, error: infoError } = await bucket.info(path);
  if (infoError || !info) {
    return { success: false, error: "Uploaded file not found" };
  }

  const stored: AttachmentFileMeta = {
    name: sanitizeAttachmentFileName(fileName),
    type: info.contentType ?? "",
    size: info.size ?? 0,
  };
  const validationError = validateAttachmentFile(stored);
  if (validationError !== null) {
    await bucket.remove([path]);
    return { success: false, error: validationError };
  }

  const { data, error } = await supabase
    .from("lesson_attachments")
    .insert({
      lesson_id: lessonId,
      file_name: stored.name,
      file_type: stored.type,
      file_size: stored.size,
      storage_path: path,
    })
    .select(ATTACHMENT_COLUMNS)
    .single();
  if (error || !data) {
    await bucket.remove([path]);
    return { success: false, error: error?.message ?? "Could not save the attachment" };
  }
  return { success: true, data: toAttachment(data as AttachmentRow) };
}

export async function deleteLessonAttachment(
  attachmentId: string,
): Promise<Result<null>> {
  if (!isUuid(attachmentId)) {
    return { success: false, error: "Attachment not found" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_attachments")
    .delete()
    .eq("id", attachmentId)
    .select("storage_path");
  if (error) {
    return { success: false, error: error.message };
  }

  // RLS turns "not allowed" into "zero rows deleted".
  const deleted = data as Array<{ storage_path: string }>;
  if (deleted.length === 0) {
    return { success: false, error: "Attachment not found" };
  }

  await supabase.storage
    .from(LESSON_ATTACHMENTS_BUCKET)
    .remove(deleted.map((row) => row.storage_path));
  return { success: true, data: null };
}

/**
 * Mints a short-lived download URL. Access is decided entirely by RLS: if the
 * caller cannot see the attachment row (e.g. not enrolled in a private
 * course), the lookup comes back empty and no URL is issued.
 */
export async function getAttachmentDownloadUrl(
  attachmentId: string,
): Promise<Result<string>> {
  if (!isUuid(attachmentId)) {
    return { success: false, error: "Attachment not found" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_attachments")
    .select("file_name, storage_path")
    .eq("id", attachmentId)
    .maybeSingle();
  if (error || !data) {
    return { success: false, error: "Attachment not found" };
  }

  const row = data as { file_name: string; storage_path: string };
  const { data: signed, error: signError } = await supabase.storage
    .from(LESSON_ATTACHMENTS_BUCKET)
    .createSignedUrl(row.storage_path, ATTACHMENT_DOWNLOAD_TTL_SECONDS, {
      download: row.file_name,
    });
  if (signError || !signed) {
    return { success: false, error: "Could not create a download link" };
  }
  return { success: true, data: signed.signedUrl };
}
