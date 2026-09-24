import { Sparkles, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/features/settings/profile-form";
import { getProfileByUserId } from "@/lib/data-access/profiles";
import { ProfileType } from "@/app/types/profile";

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) {
    throw new Error("User ID is required");
  }
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    throw new Error("Profile not found");
  }
  const {username = null, bio = null, email = null, avatar_url = null} = profile as ProfileType;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Account
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Settings</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Manage your profile and how you appear to others on the platform.
        </p>
      </header>

      {/* Content */}
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left — form */}
        <div className="min-w-0">
          <ProfileForm
            userEmail={email || ""}
            initialUsername={username || ""}
            initialBio={bio || ""}
            initialAvatarUrl={avatar_url}
          />
        </div>

        {/* Right — section nav (currently just one section) */}
        <aside className="animate-pop [animation-delay:60ms]">
          <nav className="flex flex-col gap-1.5">
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl bg-primary px-3.5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Edit profile
            </button>
          </nav>

          <p className="mt-6 hidden rounded-2xl bg-secondary/60 px-4 py-3 text-xs text-muted-foreground lg:block">
            More settings sections — notifications, privacy, integrations — will
            appear here as the platform grows.
          </p>
        </aside>
      </div>
    </div>
  );
}
