import { notFound } from "next/navigation";
import { MessageCircleQuestion } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCourseSyllabus } from "@/lib/data-access/learn";
import { getCourseQuestions } from "@/lib/data-access/course-questions";
import { AskQuestionForm } from "@/components/features/course-questions/ask-question-form";
import { QuestionList } from "@/components/features/course-questions/question-list";

interface CourseQuestionsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseQuestionsPage({
  params,
}: CourseQuestionsPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params;
  const view = await getCourseSyllabus(courseId);
  if (view === null) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const questions = await getCourseQuestions(courseId);

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-pop">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          <MessageCircleQuestion className="h-3.5 w-3.5 text-primary" />
          Q&amp;A
        </span>
        <h1 className="mt-3 break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {view.course.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
          Ask the instructor anything about this course.
        </p>
      </header>

      {view.course.isEnrolled ? (
        <AskQuestionForm courseId={courseId} />
      ) : (
        <p className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
          Enrol in this course to ask a question.
        </p>
      )}

      <QuestionList
        questions={questions}
        viewerId={user?.id ?? null}
        isOwnerViewer={false}
      />
    </div>
  );
}
