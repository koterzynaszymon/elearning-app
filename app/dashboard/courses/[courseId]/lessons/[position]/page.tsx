import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getLessonAtPosition } from "@/lib/data-access/learn";
import { getLessonAttachments } from "@/lib/data-access/lesson-attachments";
import { LessonReader } from "@/components/features/learn/lesson-reader";
import { ReaderSkeleton } from "@/components/features/learn/learn-skeletons";

const FIRST_POSITION = 1;
const POSITION_PATTERN = /^\d+$/;

interface LessonPageProps {
  params: Promise<{ courseId: string; position: string }>;
}

function parsePosition(raw: string): number | null {
  if (!POSITION_PATTERN.test(raw)) {
    return null;
  }
  const value = Number.parseInt(raw, 10);
  return value >= FIRST_POSITION ? value : null;
}

export default function LessonPage({
  params,
}: LessonPageProps): React.JSX.Element {
  return (
    <Suspense fallback={<ReaderSkeleton />}>
      <ReaderContent params={params} />
    </Suspense>
  );
}

async function ReaderContent({
  params,
}: LessonPageProps): Promise<React.JSX.Element> {
  const { courseId, position } = await params;
  const parsed = parsePosition(position);
  if (parsed === null) {
    notFound();
  }

  const view = await getLessonAtPosition(courseId, parsed);
  if (view === null) {
    notFound();
  }

  const attachments = await getLessonAttachments(view.lesson.id);

  return (
    <LessonReader
      course={view.course}
      lesson={view.lesson}
      spine={view.spine}
      attachments={attachments}
    />
  );
}
