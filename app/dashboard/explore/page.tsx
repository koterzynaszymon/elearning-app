import { Compass } from "lucide-react";
import { getPublishedCourses } from "@/lib/data-access/courses";
import { getEnrolledCourseIds } from "@/lib/data-access/enrollments";
import { ExploreCatalogue } from "@/components/features/explore/explore-catalogue";

export default async function ExplorePage(): Promise<React.JSX.Element> {
  const [courses, enrolledIds] = await Promise.all([
    getPublishedCourses(),
    getEnrolledCourseIds(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Compass className="h-3.5 w-3.5 text-primary" />
          Explore
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find your next <span className="text-gradient-brand">course</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Search the catalogue, filter by access, and join a course to start
          learning right away.
        </p>
      </header>

      <div className="animate-pop [animation-delay:60ms]">
        <ExploreCatalogue
          courses={courses}
          initialJoinedIds={enrolledIds}
        />
      </div>
    </div>
  );
}
