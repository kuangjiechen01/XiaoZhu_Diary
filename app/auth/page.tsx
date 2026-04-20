"use client";

import { HeartHandshake } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthPanel } from "@/components/forms/auth-panel";
import { useAuth } from "@/components/providers/auth-provider";

export default function AuthPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && profile?.primarySpaceId) {
      router.replace("/dashboard");
    } else if (user) {
      router.replace("/onboarding");
    }
  }, [loading, profile?.primarySpaceId, router, user]);

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-lg items-center px-4 py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[34px] border border-white/70 bg-paper-glow p-8 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground">
            <HeartHandshake className="h-4 w-4 text-primary" />
            适合长期使用的情侣共同回忆记录 APP
          </div>
          <div className="mt-8 max-w-xl space-y-5">
            <h1 className="font-serif text-4xl leading-tight text-foreground">
              把共同生活认真记下来，
              <br />
              也让它足够稳定、耐用、可同步。
            </h1>
            <p className="text-base leading-8 text-muted-foreground">
              这不是偏展示型的浪漫 demo，而是一套支持双人协作、云同步、长期积累、检索和提醒的正式产品原型。
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/85 p-4">
                <p className="text-sm font-medium">共同空间</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  创建邀请码后，你和另一半共享同一个情侣空间。
                </p>
              </div>
              <div className="rounded-3xl bg-white/85 p-4">
                <p className="text-sm font-medium">云同步 + 本地缓存</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  在线优先，最近数据可缓存，掉线后也不会立刻失忆。
                </p>
              </div>
              <div className="rounded-3xl bg-white/85 p-4">
                <p className="text-sm font-medium">回忆 / 愿望 / 留言分层</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  过去、现在、未来都分清楚，翻很久以前也不会乱。
                </p>
              </div>
              <div className="rounded-3xl bg-white/85 p-4">
                <p className="text-sm font-medium">隐私优先</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  默认私密空间，支持仅自己可见和双方可见两种记录方式。
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="flex items-center">
          <AuthPanel />
        </section>
      </div>
    </main>
  );
}
