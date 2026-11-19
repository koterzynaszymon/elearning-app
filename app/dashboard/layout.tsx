import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUnreadAnswerCounts } from "@/lib/data-access/question-reads";
import { totalUnreadAnswers } from "@/lib/unread-answers";
import { DashboardSidebar } from "@/components/features/dashboard/dashboard-sidebar";
import { SidebarFallback } from "@/components/features/dashboard/sidebar-fallback";

const FALLBACK_USER_LABEL = "learner";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      <Suspense fallback={<SidebarFallback />}>
        <SessionSidebar />
      </Suspense>
      <main className="flex-1">
        <div className="dashboard-container mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Unauthenticated requests are already turned away by the proxy before any of
 * this renders; this redirect is the second line of defence, not the first.
 */
async function SessionSidebar(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userEmail =
    typeof data.claims.email === "string"
      ? data.claims.email
      : FALLBACK_USER_LABEL;
  const unreadAnswers = totalUnreadAnswers(await getUnreadAnswerCounts());

  return <DashboardSidebar userEmail={userEmail} unreadAnswers={unreadAnswers} />;
}
