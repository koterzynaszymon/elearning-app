import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Plus,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATS: readonly Stat[] = [
  { label: "Enrolled courses", value: "0", icon: BookOpen },
  { label: "In progress", value: "0", icon: Clock },
  { label: "Completed", value: "0", icon: CheckCircle2 },
  { label: "Hours this week", value: "0", icon: GraduationCap },
];

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Your learning space
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Track your courses and pick up right where you left off.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-11">
            <UserPlus className="h-4 w-4" />
            Join a course
          </Button>
          <Button className="group h-11">
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Create a course
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="flex items-center gap-4 p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums leading-none">
                {value}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {label}
              </p>
            </div>
          </Card>
        ))}
      </section>

      {/* My courses */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">My courses</h2>
        </div>

        {/* Empty state — replace with a course card grid once data is wired */}
        <Card className="relative overflow-hidden border-dashed">
          <div className="bg-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-400 text-primary-foreground shadow-glow">
              <BookOpen className="h-6 w-6" />
            </span>
            <div className="max-w-md">
              <h3 className="text-lg font-semibold">No courses yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first course as an instructor, or join one with an
                invite code to start learning.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button className="group">
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                Create a course
              </Button>
              <Button variant="outline">
                <UserPlus className="h-4 w-4" />
                Join a course
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
