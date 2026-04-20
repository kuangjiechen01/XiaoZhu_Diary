"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SpaceSetupPanel } from "@/components/forms/space-setup-panel";
import { useAuth } from "@/components/providers/auth-provider";
import { LoadingPanel } from "@/components/ui/loading-panel";

export default function OnboardingPage() {
  const router = useRouter();
  const { loading, user, profile } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (profile?.primarySpaceId) {
      router.replace("/dashboard");
    }
  }, [loading, profile?.primarySpaceId, router, user]);

  if (loading || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <LoadingPanel label="正在准备空间设置..." />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-screen-lg px-4 py-8">
      <div className="mb-6 max-w-2xl space-y-2">
        <h1 className="font-serif text-3xl">先把你们的情侣空间建起来</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          从这里开始，决定是你来创建空间，还是用另一半发来的邀请码加入。
        </p>
      </div>
      <SpaceSetupPanel />
    </main>
  );
}
