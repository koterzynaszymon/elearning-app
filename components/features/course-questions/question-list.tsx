import { MessageCircleQuestion } from "lucide-react";
import { QuestionItem } from "./question-item";
import type { CourseQuestion } from "@/app/types/course-questions";

interface QuestionListProps {
  readonly questions: readonly CourseQuestion[];
  readonly viewerId: string | null;
  readonly isOwnerViewer: boolean;
  /** Questions whose answer the learner hasn't seen yet. */
  readonly newAnswerIds?: readonly string[];
}

export function QuestionList({
  questions,
  viewerId,
  isOwnerViewer,
  newAnswerIds = [],
}: QuestionListProps): React.JSX.Element {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <MessageCircleQuestion className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">
            No questions yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {isOwnerViewer
              ? "Questions from your learners will show up here."
              : "Be the first to ask something about this course."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          canAnswer={isOwnerViewer}
          canDelete={isOwnerViewer || question.askedBy.id === viewerId}
          isNewAnswer={newAnswerIds.includes(question.id)}
        />
      ))}
    </ul>
  );
}
