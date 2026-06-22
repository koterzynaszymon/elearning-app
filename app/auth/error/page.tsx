import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;

  return (
    <p className="text-sm text-muted-foreground">
      {params?.error
        ? `Error code: ${params.error}`
        : "An unspecified error occurred."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}): React.JSX.Element {
  return (
    <Card className="border-border/70 shadow-glow">
      <CardHeader className="items-start gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>We couldn&apos;t complete that request</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Suspense>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
        <Button asChild className="w-full">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
