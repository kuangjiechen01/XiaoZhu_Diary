import { ProtectedShell } from "@/components/app-shell/protected-shell";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
