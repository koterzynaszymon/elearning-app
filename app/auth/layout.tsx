import { AuthShell } from "@/components/features/auth/auth-shell";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <AuthShell>{children}</AuthShell>;
}
