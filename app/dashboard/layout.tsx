import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/features/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userEmail =
    typeof data.claims.email === "string" ? data.claims.email : "learner";

  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      <DashboardSidebar userEmail={userEmail} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
