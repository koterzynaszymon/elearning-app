import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { getCourseByIdForAuthor } from "@/lib/data-access/courses";
import { StudentsTabs } from "@/components/features/author-space/students-tabs";

interface StudentsLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ courseId: string }>;
}

export default async function StudentsLayout({
  children,
  params,
}: StudentsLayoutProps): Promise<React.JSX.Element> {
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
          <Users className="h-3.5 w-3.5 text-primary" />
          Students
        </span>
        <h1 className="mt-3 break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
          Manage who can access this course and follow how far each learner has
          got.
        </p>
      </header>

      <StudentsTabs courseId={courseId} />

      <div className="animate-pop [animation-delay:60ms]">{children}</div>
    </div>
  );
}
