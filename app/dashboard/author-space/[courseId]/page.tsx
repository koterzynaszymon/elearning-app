import { notFound } from "next/navigation";
import { Presentation } from "lucide-react";
import { getCourseByIdForAuthor } from "@/lib/data-access/courses";
import { CourseManageView } from "@/components/features/author-space/course-manage-view";

interface ManageCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function ManageCoursePage({
  params,
}: ManageCoursePageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const course = await getCourseByIdForAuthor(courseId);
  if (course === null) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Presentation className="h-3.5 w-3.5 text-primary" />
          Author space
        </span>
        <h1 className="mt-3 break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {course.title}
        </h1>
        {course.description !== null && course.description.length > 0 && (
          <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        )}
      </header>

      <CourseManageView course={course} />
    </div>
  );
}
