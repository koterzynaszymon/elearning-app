export const LESSON_ATTACHMENTS_BUCKET = "lesson-attachments";
export const MAX_ATTACHMENTS_PER_LESSON = 3; // mirrors the validate_lesson_attachment trigger
export const ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB — mirrors the bucket's file_size_limit
export const ATTACHMENT_FILE_NAME_MAX = 255;
/** Signed download URLs are minted per click, so they only need to outlive the redirect. */
export const ATTACHMENT_DOWNLOAD_TTL_SECONDS = 60;

/** MIME type → stored file extension. Mirrors the bucket's allowed_mime_types. */
export const ATTACHMENT_MIME_EXTENSIONS = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

export type AttachmentMimeType = keyof typeof ATTACHMENT_MIME_EXTENSIONS;

export const ATTACHMENT_ACCEPT = [
  ...Object.keys(ATTACHMENT_MIME_EXTENSIONS),
  ".pdf,.docx,.pptx,.xlsx,.txt,.csv,.zip,.png,.jpg,.jpeg,.webp",
].join(",");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const PATH_SEPARATORS = /[\\/]/g;

export type AttachmentFileMeta = {
  readonly name: string;
  readonly type: string;
  readonly size: number;
};

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isAttachmentMimeType(type: string): type is AttachmentMimeType {
  return Object.hasOwn(ATTACHMENT_MIME_EXTENSIONS, type);
}

/** Display name only — never used to build a storage path. */
export function sanitizeAttachmentFileName(name: string): string {
  return name
    .replace(CONTROL_CHARS, "")
    .replace(PATH_SEPARATORS, "_")
    .trim()
    .slice(0, ATTACHMENT_FILE_NAME_MAX);
}

export function validateAttachmentFile(file: AttachmentFileMeta): string | null {
  if (!isAttachmentMimeType(file.type)) {
    return "Unsupported file type. Use PDF, Office, text, CSV, ZIP or image files.";
  }
  if (file.size <= 0) {
    return "The file is empty.";
  }
  if (file.size > ATTACHMENT_MAX_SIZE_BYTES) {
    return "Files must be 10MB or smaller.";
  }
  if (sanitizeAttachmentFileName(file.name).length === 0) {
    return "The file needs a name.";
  }
  return null;
}

/** Stable app link that re-checks access and redirects to a signed URL. */
export function attachmentHref(attachmentId: string): string {
  return `/dashboard/attachments/${attachmentId}`;
}

export function attachmentFolder(courseId: string, lessonId: string): string {
  return `${courseId}/${lessonId}/`;
}

export function attachmentObjectPath(
  courseId: string,
  lessonId: string,
  objectId: string,
  type: AttachmentMimeType,
): string {
  return `${attachmentFolder(courseId, lessonId)}${objectId}.${ATTACHMENT_MIME_EXTENSIONS[type]}`;
}

/** True only for a path the server itself could have generated for this lesson. */
export function isValidAttachmentPath(
  path: string,
  courseId: string,
  lessonId: string,
): boolean {
  const folder = attachmentFolder(courseId, lessonId);
  if (!path.startsWith(folder)) return false;
  const [objectId, ext, ...rest] = path.slice(folder.length).split(".");
  return (
    rest.length === 0 &&
    objectId !== undefined &&
    isUuid(objectId) &&
    Object.values(ATTACHMENT_MIME_EXTENSIONS).some((known) => known === ext)
  );
}

const SIZE_UNITS = ["B", "KB", "MB"] as const;
const SIZE_STEP = 1024;

export function formatFileSize(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= SIZE_STEP && unit < SIZE_UNITS.length - 1) {
    value /= SIZE_STEP;
    unit++;
  }
  const rounded = unit === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${SIZE_UNITS[unit]}`;
}
