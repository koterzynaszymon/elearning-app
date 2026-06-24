"use client";

import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { updateProfileByUserId } from "@/lib/data-access/profiles";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  userEmail: string;
  initialUsername?: string;
  initialBio?: string;
}

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "error"; message: string };

export function ProfileForm({
  userEmail,
  initialUsername = "",
  initialBio = "",
}: ProfileFormProps): React.JSX.Element {
  const [baseline, setBaseline] = useState({
    username: initialUsername,
    bio: initialBio ?? "",
  });
  const [username, setUsername] = useState(baseline.username);
  const [bio, setBio] = useState(baseline.bio);
  const isDirty = username !== baseline.username || bio !== baseline.bio;
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const avatarInitial = (username || userEmail).charAt(0).toUpperCase();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!isDirty || saveState.status === "saving") return;
    setError(null);

    
    const result = await updateProfileByUserId({ username, bio });
    if (result.success) {
      const nextUsername = result.data.username ?? "";
      const nextBio = result.data.bio ?? "";
      setUsername(nextUsername);
      setBio(nextBio);
      setBaseline({ username: nextUsername, bio: nextBio }); // ← this clears isDirty
      setSaveState({ status: "saved" });
      setTimeout(() => setSaveState({ status: "idle" }), 2500);
    } else {
      setError(result.error || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar + identity preview */}
      <section className="animate-pop flex flex-col items-center gap-4 rounded-3xl border border-border bg-gradient-to-br from-brand-50 to-accent/40 p-8 text-center [animation-delay:80ms] dark:from-card dark:to-accent/20">
        <div className="relative">
          <span className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-400 to-brand-600 font-display text-4xl font-extrabold text-primary-foreground shadow-glow">
            {avatarInitial}
          </span>
          <button
            type="button"
            aria-label="Change avatar (coming soon)"
            title="Avatar upload coming soon"
            className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-60 shadow-soft transition-opacity hover:opacity-80"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          <p className="font-display text-lg font-extrabold">
            {username || userEmail.split("@")[0]}
          </p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Avatar upload coming in a future update
        </span>
      </section>

      {/* Form fields */}
      <section className="animate-pop rounded-3xl border border-border bg-card p-6 shadow-soft [animation-delay:160ms]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">
              Profile details
            </h2>
            <p className="text-xs text-muted-foreground">
              How others see you on the platform.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Nickname */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="text-sm font-bold">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="e.g. curious_learner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={40}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              This is the name shown to instructors and fellow students.
            </p>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio" className="text-sm font-bold">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us a little about yourself — what are you learning and why?"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={4}
              className="resize-none rounded-xl"
            />
            <p className="text-right text-xs text-muted-foreground">
              {bio.length} / 280
            </p>
          </div>

          {/* Email — read-only */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="flex items-center gap-1.5 text-sm font-bold"
            >
              Email address
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                <Lock className="h-2.5 w-2.5" />
                read-only
              </span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={userEmail}
                readOnly
                disabled
                className="rounded-xl pr-10 opacity-70"
              />
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground">
              Email is managed by your authentication provider and cannot be
              changed here.
            </p>
          </div>
        </div>
      </section>

      {/* Save bar */}
      <div
        className={cn(
          "animate-pop flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-3.5 shadow-soft [animation-delay:240ms]",
          saveState.status === "error" &&
            "border-destructive/40 bg-destructive/5",
        )}
      >
        {saveState.status === "error" ? (
          <p className="text-sm font-semibold text-destructive">
            {saveState.message}
          </p>
        ) : saveState.status === "saved" ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint">
            <CheckCircle2 className="h-4 w-4" />
            Profile saved!
          </span>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isDirty ? "You have unsaved changes." : "All changes saved."}
          </p>
        )}

        <Button
          type="submit"
          disabled={!isDirty || saveState.status === "saving"}
          className="rounded-full shadow-glow"
        >
          {saveState.status === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </form>
  );
}
