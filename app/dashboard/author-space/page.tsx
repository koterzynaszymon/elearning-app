import { Suspense } from "react";
import { Presentation } from "lucide-react";
import { getCoursesByAuthor } from "@/lib/data-access/courses";
import { AuthorSpaceView } from "@/components/features/author-space/author-space-view";
import { AuthorSpaceSkeleton } from "@/components/features/author-space/author-space-skeleton";

export default function AuthorSpacePage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <Presentation className="h-3.5 w-3.5 text-primary" />
          Author space
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Manage what you <span className="text-gradient-brand">teach</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Every course you&apos;ve created, in one place. Pick one to edit its
          content, review students, or change its settings.
        </p>
      </header>

      <div className="animate-pop [animation-delay:60ms]">
        <Suspense fallback={<AuthorSpaceSkeleton />}>
          <AuthoredCourses />
        </Suspense>
      </div>
    </div>
  );
}

async function AuthoredCourses(): Promise<React.JSX.Element> {
  const courses = await getCoursesByAuthor();
  return <AuthorSpaceView courses={courses} />;
}
