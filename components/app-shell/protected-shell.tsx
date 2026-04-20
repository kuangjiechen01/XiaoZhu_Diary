"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { RealtimeListener } from "@/components/app-shell/realtime-listener";
import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useCurrentSpace } from "@/lib/hooks/use-app-data";
import { useSyncStatus } from "@/lib/hooks/use-sync-status";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const repository = useRepository();
  const { user, profile, loading } = useAuth();
  const { data: space, isLoading: spaceLoading } = useCurrentSpace();
  const syncStatus = useSyncStatus();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (user && !profile?.primarySpaceId && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [loading, pathname, profile?.primarySpaceId, router, user]);

  if (loading || (user && profile?.primarySpaceId && spaceLoading)) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <LoadingPanel label="正在准备你们的空间..." />
      </main>
    );
  }

  if (!user || !profile) return null;

  return (
    <>
      <RealtimeListener spaceId={profile.primarySpaceId} />
      <main className="mx-auto min-h-screen max-w-screen-sm px-4 pb-28 pt-5 lg:max-w-screen-lg lg:px-8 lg:pb-10">
        <div className="mb-6 flex items-center justify-between gap-3 rounded-[30px] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar fallback={profile.nickname} src={profile.avatarUrl} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{space?.name ?? "情侣空间"}</p>
                <Badge variant="subtle">{syncStatus.label}</Badge>
                {repository.mode === "demo" ? <Badge variant="accent">Demo</Badge> : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.nickname}
                {profile.partnerLabel ? ` · 对 ${profile.partnerLabel} 可见` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/memories/new"
              className={cn(buttonVariants({ variant: "default", size: "icon" }))}
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {children}
      </main>
      <MobileNav />
    </>
  );
}
