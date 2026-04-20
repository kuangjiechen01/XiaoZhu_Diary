"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { LoadingPanel } from "@/components/ui/loading-panel";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (!profile?.primarySpaceId) {
      router.replace("/onboarding");
      return;
    }
    router.replace("/dashboard");
  }, [loading, profile?.primarySpaceId, router, user]);

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
      <LoadingPanel label="正在进入小猪 APP..." />
    </main>
  );
}
