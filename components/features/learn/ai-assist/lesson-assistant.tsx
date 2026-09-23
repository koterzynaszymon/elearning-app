"use client";

import { useRef } from "react";
import { MousePointerClick, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiAssistPanel } from "./ai-assist-panel";
import { SelectionAskBubble } from "./selection-ask-bubble";
import { useLessonAiAssist } from "./use-lesson-ai-assist";

interface LessonAssistantProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly children: React.ReactNode;
}


export function LessonAssistant({
  lessonId,
  lessonTitle,
  children,
}: LessonAssistantProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const assist = useLessonAiAssist({ lessonId, lessonTitle });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <MousePointerClick className="h-3.5 w-3.5" />
          Highlight any text with left mouse button to ask the assistant about it.
        </p>
        <button
          type="button"
          onClick={assist.isOpen ? assist.close : assist.open}
          aria-pressed={assist.isOpen}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors",
            assist.isOpen
              ? "border-primary/40 bg-primary/12 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Assistant
        </button>
      </div>

      <div ref={containerRef}>{children}</div>

      <SelectionAskBubble containerRef={containerRef} onAsk={assist.openWithSelection} />

      <AiAssistPanel
        open={assist.isOpen}
        onClose={assist.close}
        pendingSelection={assist.pendingSelection}
        onClearSelection={assist.clearSelection}
        entries={assist.entries}
        isBusy={assist.isBusy}
        onSubmit={assist.submit}
      />
    </div>
  );
}
