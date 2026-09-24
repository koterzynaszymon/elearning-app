export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MiB — mirrors the bucket's file_size_limit
export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export function avatarObjectPath(userId: string): string {
  return `${userId}/avatar`;
}
