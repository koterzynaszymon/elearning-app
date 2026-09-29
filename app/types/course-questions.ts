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
