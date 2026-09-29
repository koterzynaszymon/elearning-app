"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Save,
  Tag,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { updateCourseSettings } from "@/lib/data-access/courses";
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  type CourseCategory,
  type CourseLevel,
} from "@/app/types/course";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/constants/course-taxonomy";

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 320;
const PASSWORD_MIN = 4;

type Visibility = "public" | "private";

interface VisibilityOption {
  readonly value: Visibility;
  readonly label: string;
  readonly hint: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const VISIBILITY_OPTIONS: readonly VisibilityOption[] = [
  {
    value: "public",
    label: "Public",
    hint: "Anyone can discover and join from the catalogue.",
    icon: Globe,
  },
  {
    value: "private",
    label: "Private",
    hint: "Only people with the password can enrol.",
    icon: Lock,
  },
];

type SubmitState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "error"; message: string };

interface CourseSettingsFormProps {
  readonly courseId: string;
  readonly title: string;
  readonly description: string;
  readonly isPublic: boolean;
  readonly hasPassword: boolean;
  readonly category: CourseCategory;
  readonly level: CourseLevel;
}

export function CourseSettingsForm({
  courseId,
  title: initialTitle,
  description: initialDescription,
  isPublic: initialIsPublic,
  hasPassword: initialHasPassword,
  category: initialCategory,
  level: initialLevel,
}: CourseSettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] = useState<Visibility>(
    initialIsPublic ? "public" : "private",
  );
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<CourseCategory>(initialCategory);
  const [level, setLevel] = useState<CourseLevel>(initialLevel);
  const [showPassword, setShowPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const isPrivate = visibility === "private";
  const isSaving = submitState.status === "saving";
  const titleValid = title.trim().length > 0;
  const passwordValid =
    !isPrivate || hasPassword || password.trim().length >= PASSWORD_MIN;
  const canSubmit = titleValid && passwordValid && !isSaving;

  function resetFeedback(): void {
    if (submitState.status === "saved" || submitState.status === "error") {
      setSubmitState({ status: "idle" });
    }
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitState({ status: "saving" });

    const result = await updateCourseSettings({
      courseId,
      title,
      description: description.trim() || null,
      isPublic: !isPrivate,
      password: isPrivate ? password.trim() || null : null,
      category,
      level,
    });

    if (result.success) {
      setHasPassword(isPrivate);
      setPassword("");
      setSubmitState({ status: "saved" });
      router.refresh();
      return;
    }
    setSubmitState({ status: "error", message: result.error });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:max-w-2xl"
    >
      {/* Identity card */}
      <section className="animate-pop rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Type className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">
              The basics
            </h2>
            <p className="text-xs text-muted-foreground">
              Update the title and description students see.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-sm font-bold">
              Course title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Intro to Watercolour Painting"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                resetFeedback();
              }}
              maxLength={TITLE_MAX}
              autoComplete="off"
              className="h-11 rounded-xl text-base"
            />
            <p className="text-right text-xs text-muted-foreground">
              {title.length} / {TITLE_MAX}
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-bold">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What will students learn? Who is this course for? Set the scene in a few friendly sentences."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                resetFeedback();
              }}
              maxLength={DESCRIPTION_MAX}
              rows={5}
              className="resize-none rounded-xl"
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.length} / {DESCRIPTION_MAX}
            </p>
          </div>
        </div>
      </section>

      {/* Category & level card */}
      <section className="animate-pop rounded-3xl border border-border bg-card p-6 shadow-soft [animation-delay:40ms]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Tag className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">
              Classify it
            </h2>
            <p className="text-xs text-muted-foreground">
              Helps students find this course in the catalogue.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-bold">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Category
            </Label>
            <div
              role="radiogroup"
              aria-label="Course category"
              className="flex flex-wrap gap-1.5"
            >
              {COURSE_CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={category === value}
                  onClick={() => {
                    setCategory(value);
                    resetFeedback();
                  }}
                  className={cn(
                    "rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors",
                    category === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-bold">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Level
            </Label>
            <div
              role="radiogroup"
              aria-label="Course level"
              className="flex flex-wrap gap-1.5"
            >
              {COURSE_LEVELS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={level === value}
                  onClick={() => {
                    setLevel(value);
                    resetFeedback();
                  }}
                  className={cn(
                    "rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors",
                    level === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {LEVEL_LABELS[value]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visibility card */}
      <section className="animate-pop rounded-3xl border border-border bg-card p-6 shadow-soft [animation-delay:80ms]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mint/15 text-mint">
            <Globe className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">
              Who can join?
            </h2>
            <p className="text-xs text-muted-foreground">
              Change this whenever you like.
            </p>
          </div>
        </div>

        {/* Segmented visibility selector */}
        <div
          role="radiogroup"
          aria-label="Course visibility"
          className="grid gap-3 sm:grid-cols-2"
        >
          {VISIBILITY_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
            const active = visibility === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setVisibility(value);
                  resetFeedback();
                }}
                className={cn(
                  "group relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-base font-bold">
                  {label}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {hint}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-3 top-3 h-3 w-3 rounded-full border-2 transition-colors",
                    active
                      ? "border-primary bg-primary"
                      : "border-border bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Password — revealed for private courses */}
        <div
          className={cn(
            "grid transition-all duration-300",
            isPrivate
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <Label
                htmlFor="password"
                className="flex items-center gap-1.5 text-sm font-bold"
              >
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                Access password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    hasPassword
                      ? "Leave blank to keep the current password"
                      : "Share this with the students you invite"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    resetFeedback();
                  }}
                  disabled={!isPrivate}
                  autoComplete="off"
                  className="h-11 rounded-xl pr-11 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasPassword
                  ? `At least ${PASSWORD_MIN} characters if you want to change it.`
                  : `At least ${PASSWORD_MIN} characters. Students enter this once to unlock the course.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action bar */}
      <div
        className={cn(
          "animate-pop flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-soft [animation-delay:160ms]",
          submitState.status === "error" &&
            "border-destructive/40 bg-destructive/5",
        )}
      >
        {submitState.status === "error" ? (
          <p className="text-sm font-semibold text-destructive">
            {submitState.message}
          </p>
        ) : submitState.status === "saved" ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-mint">
            <Check className="h-4 w-4" />
            Changes saved
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Changes apply immediately.
          </p>
        )}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="group h-11 shrink-0 rounded-full px-6 shadow-glow"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
