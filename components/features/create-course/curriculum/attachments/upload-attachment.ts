import { createClient } from "@/lib/supabase/client";
import {
  confirmAttachmentUpload,
  createAttachmentUpload,
} from "@/lib/data-access/lesson-attachments";
import {
  LESSON_ATTACHMENTS_BUCKET,
  validateAttachmentFile,
} from "@/lib/supabase/lesson-attachments";
import type { LessonAttachment } from "@/app/types/lesson";
import type { Result } from "@/app/types/profile";

/**
 * Three-step upload: the server issues a signed upload token for a path it
 * chose, the browser sends the bytes straight to Storage, then the server
 * verifies the stored object and records it.
 */
export async function uploadLessonAttachment(
  lessonId: string,
  file: File,
): Promise<Result<LessonAttachment>> {
  const validationError = validateAttachmentFile(file);
  if (validationError !== null) {
    return { success: false, error: validationError };
  }

  const ticket = await createAttachmentUpload(lessonId, {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!ticket.success) return ticket;

  const { error: uploadError } = await createClient()
    .storage.from(LESSON_ATTACHMENTS_BUCKET)
    .uploadToSignedUrl(ticket.data.path, ticket.data.token, file, {
      contentType: file.type,
    });
  if (uploadError) {
    return { success: false, error: "Upload failed. Please try again." };
  }

  return confirmAttachmentUpload(lessonId, ticket.data.path, file.name);
}
