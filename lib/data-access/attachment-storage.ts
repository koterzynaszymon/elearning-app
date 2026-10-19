import type { createClient } from "@/lib/supabase/server";
import { LESSON_ATTACHMENTS_BUCKET } from "@/lib/supabase/lesson-attachments";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Deleting a lesson cascades its attachment rows, but Storage objects are not
 * rows we can cascade to — collect their paths first, remove them after.
 */
export async function getAttachmentPathsForLessons(
  supabase: ServerClient,
  lessonIds: readonly string[],
): Promise<string[]> {
  if (lessonIds.length === 0) return [];
  const { data, error } = await supabase
    .from("lesson_attachments")
    .select("storage_path")
    .in("lesson_id", lessonIds);
  if (error) {
    console.error(error);
    return [];
  }
  return (data as Array<{ storage_path: string }>).map((row) => row.storage_path);
}


export async function removeAttachmentObjects(
  supabase: ServerClient,
  paths: readonly string[],
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage
    .from(LESSON_ATTACHMENTS_BUCKET)
    .remove([...paths]);
  if (error) {
    console.error("Failed to remove attachment objects", error);
  }
}
