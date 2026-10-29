import type { CourseQuestion, UnreadAnswerCounts } from "@/app/types/course-questions";

/** An answer is new if it arrived after the learner last opened the Q&A. */
export function isNewAnswerFor(
  question: CourseQuestion,
  viewerId: string | null,
  lastSeenAt: string | null,
): boolean {
  if (viewerId === null || question.askedBy.id !== viewerId) return false;
  if (question.answeredAt === null) return false;
  if (lastSeenAt === null) return true;
  return Date.parse(question.answeredAt) > Date.parse(lastSeenAt);
}

export function totalUnreadAnswers(counts: UnreadAnswerCounts): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}
