import { MailCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page(): React.JSX.Element {
  return (
    <Card className="border-border/70 shadow-glow">
      <CardHeader className="items-start gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </span>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription>
            One quick step before you start learning
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You&apos;ve successfully signed up. We&apos;ve sent a confirmation link
          to your email — open it to activate your account, then sign in to begin.
        </p>
      </CardContent>
    </Card>
  );
}
