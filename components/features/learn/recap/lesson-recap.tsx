"use client";

import { useCallback, useState } from "react";
import { HelpCircle, ScrollText } from "lucide-react";
import { lessonRecapService } from "./lesson-recap-service";
import { RecapQuestions } from "./recap-questions";
import { RecapSummary } from "./recap-summary";
import { RecapToolButton } from "./recap-tool-button";
import { useRecapRequest } from "./use-recap-request";
import type { RecapRequestHandle } from "./use-recap-request";
import type { RecapQuestion, RecapResult } from "./types";

const SUMMARY_ID = "lesson-recap-summary";
const QUESTIONS_ID = "lesson-recap-questions";

interface LessonRecapProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly hasAttachments: boolean;
}


export function LessonRecap({
  lessonId,
  lessonTitle,
  hasAttachments,
}: LessonRecapProps): React.JSX.Element {
  const fetchSummary = useCallback(
    (): Promise<RecapResult<string>> =>
      lessonRecapService.summarize({ lessonId, lessonTitle }),
    [lessonId, lessonTitle],
  );
  const fetchQuestions = useCallback(
    (): Promise<RecapResult<readonly RecapQuestion[]>> =>
      lessonRecapService.generateQuestions({ lessonId, lessonTitle }),
    [lessonId, lessonTitle],
  );

  const summary = useRecapRequest(fetchSummary);
  const questions = useRecapRequest(fetchQuestions);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <RecapToolButton
          icon={ScrollText}
          title="Summarize"
          meta="The lesson in 5–6 sentences"
          tone="brand"
          state={summary.state}
          isOpen={summaryOpen}
          controls={SUMMARY_ID}
          onClick={() => activate(summary, summaryOpen, setSummaryOpen)}
        />
        <RecapToolButton
          icon={HelpCircle}
          title="Review questions"
          meta="3 questions, answers hidden"
          tone="mint"
          state={questions.state}
          isOpen={questionsOpen}
          controls={QUESTIONS_ID}
          onClick={() => activate(questions, questionsOpen, setQuestionsOpen)}
        />
      </div>

      <p className="px-1 text-[0.7rem] text-muted-foreground">
        Generated only when you ask, from the lesson text
        {hasAttachments ? " — attached files aren't included." : "."}
      </p>

      {summaryOpen && (
        <RecapSummary
          id={SUMMARY_ID}
          state={summary.state}
          onRetry={summary.run}
          onHide={() => setSummaryOpen(false)}
        />
      )}
      {questionsOpen && (
        <RecapQuestions
          id={QUESTIONS_ID}
          state={questions.state}
          onRetry={questions.run}
          onHide={() => setQuestionsOpen(false)}
        />
      )}
    </div>
  );
}

/** First click (or after an error) fetches; once loaded the button toggles. */
function activate<T>(
  handle: RecapRequestHandle<T>,
  isOpen: boolean,
  setOpen: (open: boolean) => void,
): void {
  if (handle.state.status === "done") {
    setOpen(!isOpen);
    return;
  }
  handle.run();
  setOpen(true);
}
