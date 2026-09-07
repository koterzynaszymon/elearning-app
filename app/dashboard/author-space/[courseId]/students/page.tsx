import { notFound } from "next/navigation";
import { getCourseByIdForAuthor } from "@/lib/data-access/courses";
import { getCourseRoster } from "@/lib/data-access/roster";
import { StudentRoster } from "@/components/features/author-space/student-roster";

interface ManageStudentsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function ManageStudentsPage({
  params,
}: ManageStudentsPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const course = await getCourseByIdForAuthor(courseId);
  if (course === null) {
    notFound();
  }

  const students = await getCourseRoster(courseId);

  return (
    <StudentRoster
      courseId={courseId}
      courseTitle={course.title}
      students={students}
    />
  );
}
