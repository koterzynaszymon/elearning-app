import { notFound } from "next/navigation";
import { getCourseByIdForAuthor } from "@/lib/data-access/courses";
import { getCourseRoster } from "@/lib/data-access/roster";
import { StudentProgress } from "@/components/features/author-space/student-progress";

interface TrackProgressPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function TrackProgressPage({
  params,
}: TrackProgressPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const course = await getCourseByIdForAuthor(courseId);
  if (course === null) {
    notFound();
  }

  const students = await getCourseRoster(courseId);

  return <StudentProgress courseTitle={course.title} students={students} />;
}
