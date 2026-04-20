"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { queryKeys } from "@/lib/hooks/use-app-data";
import { createSpaceSchema, joinSpaceSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateSpaceValues = z.infer<typeof createSpaceSchema>;
type JoinSpaceValues = z.infer<typeof joinSpaceSchema>;

export function SpaceSetupPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { user, refreshProfile } = useAuth();

  const createForm = useForm<CreateSpaceValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "我们的小宇宙",
      startedOn: ""
    }
  });

  const joinForm = useForm<JoinSpaceValues>({
    resolver: zodResolver(joinSpaceSchema),
    defaultValues: {
      code: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateSpaceValues) =>
      repository.createSpace(user!.id, {
        name: values.name,
        startedOn: values.startedOn || undefined
      }),
    onSuccess: async () => {
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile(user?.id) });
      toast.success("情侣空间创建成功");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "创建空间失败");
    }
  });

  const handleCreate = createForm.handleSubmit((values) => createMutation.mutate(values));

  const handleJoin = joinForm.handleSubmit((values) => {
    router.push(`/invite/${values.code.trim().toUpperCase()}`);
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="space-y-5">
        <div className="space-y-2">
          <CardTitle>创建情侣空间</CardTitle>
          <CardDescription>
            一个账号只能加入一个情侣空间。创建后可生成邀请码，让另一半加入同一个空间。
          </CardDescription>
        </div>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label htmlFor="space-name">空间名称</Label>
            <Input id="space-name" {...createForm.register("name")} />
            <p className="text-xs text-destructive">
              {createForm.formState.errors.name?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="space-startedOn">恋爱开始日（可选）</Label>
            <Input id="space-startedOn" type="date" {...createForm.register("startedOn")} />
          </div>
          <Button className="w-full" disabled={createMutation.isPending} type="submit">
            创建并进入空间
          </Button>
        </form>
      </Card>

      <Card className="space-y-5">
        <div className="space-y-2">
          <CardTitle>加入已有空间</CardTitle>
          <CardDescription>
            输入另一半发给你的邀请码。邀请码默认 72 小时内有效，加入后双方共享同一份数据。
          </CardDescription>
        </div>
        <form className="space-y-4" onSubmit={handleJoin}>
          <div className="space-y-2">
            <Label htmlFor="invite-code">邀请码</Label>
            <Input
              id="invite-code"
              placeholder="例如 XZLOVE"
              {...joinForm.register("code")}
            />
            <p className="text-xs text-destructive">
              {joinForm.formState.errors.code?.message}
            </p>
          </div>
          <Button className="w-full" type="submit" variant="secondary">
            预览并加入
          </Button>
        </form>
      </Card>
    </div>
  );
}
