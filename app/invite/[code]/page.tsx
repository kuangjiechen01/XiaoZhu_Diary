"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";

export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { user, profile, refreshProfile } = useAuth();

  const previewQuery = useQuery({
    queryKey: ["invite-preview", params.code],
    enabled: Boolean(params.code),
    queryFn: () => repository.previewInvitation(params.code)
  });

  const acceptMutation = useMutation({
    mutationFn: () => repository.acceptInvitation(user!.id, params.code),
    onSuccess: async () => {
      await refreshProfile();
      await queryClient.invalidateQueries();
      toast.success("已加入情侣空间");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "加入失败");
    }
  });

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <ErrorPanel
          title="需要先登录"
          description="请先登录账户，再回来接受邀请码。"
        />
      </main>
    );
  }

  if (profile?.primarySpaceId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <ErrorPanel
          title="当前账号已绑定空间"
          description="一个账号只能加入一个情侣空间。若需切换，请先在设置页解除绑定。"
        />
      </main>
    );
  }

  if (previewQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <LoadingPanel label="正在读取邀请码..." />
      </main>
    );
  }

  if (previewQuery.error || !previewQuery.data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <ErrorPanel
          title="邀请码不可用"
          description={
            previewQuery.error instanceof Error
              ? previewQuery.error.message
              : "邀请码不存在、已过期或已被使用。"
          }
        />
      </main>
    );
  }

  const { invitation, inviter, space } = previewQuery.data;

  return (
    <main className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4 py-10">
      <Card className="w-full space-y-5 p-6">
        <div className="space-y-2">
          <CardTitle>加入情侣空间</CardTitle>
          <CardDescription>
            邀请码 `{invitation.code}` 将你加入到同一个共享空间。加入后，双方可以共同维护回忆、纪念日、愿望清单和留言。
          </CardDescription>
        </div>

        <div className="rounded-3xl bg-secondary/50 p-4 text-sm leading-7 text-muted-foreground">
          <div>空间名称：{space?.name ?? invitation.spaceName ?? "未命名空间"}</div>
          <div>邀请人：{inviter?.nickname ?? invitation.inviterName ?? "对方"}</div>
          <div>有效期至：{new Date(invitation.expiresAt).toLocaleString("zh-CN")}</div>
        </div>

        <div className="space-y-3 rounded-3xl bg-muted/60 p-4 text-sm leading-7 text-muted-foreground">
          <p>加入规则：</p>
          <p>1. 一个账号只能加入一个情侣空间。</p>
          <p>2. 绑定后默认共享双方可见内容。</p>
          <p>3. 仅自己可见的记录仍然只对创建者可见。</p>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => acceptMutation.mutate()}>
            接受邀请并加入
          </Button>
          <Button className="flex-1" variant="secondary" onClick={() => router.push("/onboarding")}>
            先返回
          </Button>
        </div>
      </Card>
    </main>
  );
}
