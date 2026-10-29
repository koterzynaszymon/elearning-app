"use client";

import { useEffect, useRef } from "react";
import { markCourseAnswersSeen } from "@/lib/data-access/question-reads";

interface MarkAnswersSeenProps {
  readonly courseId: string;
}

export function MarkAnswersSeen({ courseId }: MarkAnswersSeenProps): null {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void markCourseAnswersSeen(courseId).then((result) => {
      if (!result.success) {
        console.error(result.error);
      }
    });
  }, [courseId]);

  return null;
}
