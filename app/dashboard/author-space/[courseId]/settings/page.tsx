import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { getCourseByIdForAuthor } from "@/lib/data-access/courses";
import { CourseSettingsForm } from "@/components/features/author-space/course-settings-form";

interface CourseSettingsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseSettingsPage({
  params,
}: CourseSettingsPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const course = await getCourseByIdForAuthor(courseId);
  if (course === null) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-pop">
        <Link
          href={`/dashboard/author-space/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Settings className="h-3.5 w-3.5 text-primary" />
          Settings
        </span>
        <h1 className="mt-3 break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
          Update the title, description, and who can access this course.
        </p>
      </header>

      <div className="animate-pop [animation-delay:60ms]">
        <CourseSettingsForm
          courseId={course.id}
          title={course.title}
          description={course.description ?? ""}
          isPublic={course.is_public}
          hasPassword={course.password_hash !== null}
        />
      </div>
    </div>
  );
}
