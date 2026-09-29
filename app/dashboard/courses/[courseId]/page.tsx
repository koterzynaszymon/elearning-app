import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getCourseSyllabus } from "@/lib/data-access/learn";
import { CourseSyllabus } from "@/components/features/learn/course-syllabus";
import { SyllabusSkeleton } from "@/components/features/learn/learn-skeletons";

interface CourseOverviewPageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseOverviewPage({
  params,
}: CourseOverviewPageProps): React.JSX.Element {
  return (
    <Suspense fallback={<SyllabusSkeleton />}>
      <SyllabusContent params={params} />
    </Suspense>
  );
}

async function SyllabusContent({
  params,
}: CourseOverviewPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const view = await getCourseSyllabus(courseId);
  if (view === null) {
    notFound();
  }

  const { course, lessons, ratingSummary } = view;

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          Course
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

      <CourseSyllabus
        course={course}
        lessons={lessons}
        ratingSummary={ratingSummary}
      />
    </div>
  );
}
