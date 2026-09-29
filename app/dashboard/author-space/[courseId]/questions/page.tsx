import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";
import { getCourseByIdForAuthor } from "@/lib/data-access/courses";
import { getCourseQuestions } from "@/lib/data-access/course-questions";
import { QuestionList } from "@/components/features/course-questions/question-list";

interface AuthorQuestionsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function AuthorQuestionsPage({
  params,
}: AuthorQuestionsPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const course = await getCourseByIdForAuthor(courseId);
  if (course === null) {
    notFound();
  }

  const questions = await getCourseQuestions(courseId);

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
          <MessageCircleQuestion className="h-3.5 w-3.5 text-primary" />
          Q&amp;A
        </span>
        <h1 className="mt-3 break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
          Answer questions from learners enrolled in this course.
        </p>
      </header>

      <QuestionList
        questions={questions}
        viewerId={course.author_id}
        isOwnerViewer
      />
    </div>
  );
}
