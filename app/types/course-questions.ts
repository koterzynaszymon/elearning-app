export type CourseQuestion = {
  readonly id: string;
  readonly courseId: string;
  readonly askedBy: {
    readonly id: string;
    readonly displayName: string;
  };
  readonly body: string;
  readonly answer: string | null;
  readonly answeredAt: string | null;
  readonly createdAt: string;
};

/** Course id → number of the learner's answered questions they haven't seen. */
export type UnreadAnswerCounts = Readonly<Record<string, number>>;
