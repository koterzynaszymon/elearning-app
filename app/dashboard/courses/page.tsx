import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { getEnrolledCourses } from "@/lib/data-access/my-courses";
import { MyCoursesView } from "@/components/features/my-courses/my-courses-view";
import { MyCoursesSkeleton } from "@/components/features/my-courses/my-courses-skeleton";

export default function MyCoursesPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          My courses
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Keep your <span className="text-gradient-brand">momentum</span> going
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Everything you&apos;re enrolled in, with progress at a glance. Pick a
          course and pick up right where you left off.
        </p>
      </header>

      <div className="animate-pop [animation-delay:60ms]">
        <Suspense fallback={<MyCoursesSkeleton />}>
          <EnrolledCourses />
        </Suspense>
      </div>
    </div>
  );
}

async function EnrolledCourses(): Promise<React.JSX.Element> {
  const courses = await getEnrolledCourses();
  return <MyCoursesView courses={courses} />;
}
