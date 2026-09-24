"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAvatarUrl } from "@/lib/data-access/profiles";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_BUCKET,
  AVATAR_MAX_SIZE_BYTES,
  avatarObjectPath,
} from "@/lib/supabase/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  initialAvatarUrl: string | null;
  fallbackInitial: string;
  onAvatarChange: (avatarUrl: string | null) => void;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

function validateFile(file: File): string | null {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number])) {
    return "Please choose a PNG, JPEG, or WebP image.";
  }
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return "Image must be smaller than 2MB.";
  }
  return null;
}

export function AvatarUploader({
  initialAvatarUrl,
  fallbackInitial,
  onAvatarChange,
}: AvatarUploaderProps): React.JSX.Element {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const clearPreview = (): void => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreview(null);
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setState({ status: "error", message: validationError });
      return;
    }

    clearPreview();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreview(objectUrl);
    setState({ status: "uploading" });

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      clearPreview();
      setState({ status: "error", message: "You must be signed in to change your avatar." });
      return;
    }

    const path = avatarObjectPath(user.id);
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      clearPreview();
      setState({ status: "error", message: "Upload failed. Please try again." });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const cacheBustedUrl = `${publicUrl}?v=${Date.now()}`;

    const result = await updateProfileAvatarUrl(cacheBustedUrl);
    clearPreview();

    if (!result.success) {
      setState({ status: "error", message: result.error || "Failed to save avatar." });
      return;
    }

    setAvatarUrl(cacheBustedUrl);
    onAvatarChange(cacheBustedUrl);
    setState({ status: "idle" });
  };

  const handleRemove = async (): Promise<void> => {
    if (state.status === "uploading") return;
    setState({ status: "uploading" });

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      setState({ status: "error", message: "You must be signed in to remove your avatar." });
      return;
    }

    await supabase.storage.from(AVATAR_BUCKET).remove([avatarObjectPath(user.id)]);

    const result = await updateProfileAvatarUrl(null);
    if (!result.success) {
      setState({ status: "error", message: result.error || "Failed to remove avatar." });
      return;
    }

    setAvatarUrl(null);
    onAvatarChange(null);
    setState({ status: "idle" });
  };

  const isUploading = state.status === "uploading";
  const displayUrl = preview ?? avatarUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Your avatar"
            className={cn(
              "h-24 w-24 rounded-[2rem] object-cover shadow-glow transition-opacity",
              isUploading && "opacity-50",
            )}
          />
        ) : (
          <span
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-400 to-brand-600 font-display text-4xl font-extrabold text-primary-foreground shadow-glow transition-opacity",
              isUploading && "opacity-50",
            )}
          >
            {fallbackInitial}
          </span>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <button
          type="button"
          aria-label="Change avatar"
          title="Change avatar"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

        {avatarUrl && !isUploading && (
          <button
            type="button"
            aria-label="Remove avatar"
            title="Remove avatar"
            onClick={handleRemove}
            className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft transition-opacity hover:text-destructive hover:opacity-80"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ALLOWED_MIME_TYPES.join(",")}
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {state.status === "error" && (
        <p className="max-w-[16rem] text-center text-xs font-semibold text-destructive">
          {state.message}
        </p>
      )}
    </div>
  );
}
