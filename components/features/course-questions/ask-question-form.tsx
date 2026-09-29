"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { askCourseQuestion } from "@/lib/data-access/course-questions";

interface AskQuestionFormProps {
  readonly courseId: string;
}

const BODY_MAX = 500;

export function AskQuestionForm({
  courseId,
}: AskQuestionFormProps): React.JSX.Element {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await askCourseQuestion(courseId, body);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <label
        htmlFor="question-body"
        className="font-display text-sm font-extrabold"
      >
        Ask the instructor a question
      </label>
      <Textarea
        id="question-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What would you like to ask about this course?"
        maxLength={BODY_MAX}
        rows={3}
        disabled={isPending}
      />
      <div className="flex items-center justify-between gap-3">
        {error !== null ? (
          <p className="text-sm font-semibold text-destructive">{error}</p>
        ) : (
          <span className="text-xs text-muted-foreground">
            {body.length}/{BODY_MAX}
          </span>
        )}
        <button
          type="submit"
          disabled={isPending || body.trim().length === 0}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:opacity-95 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isPending ? "Sending…" : "Ask"}
        </button>
      </div>
    </form>
  );
}
