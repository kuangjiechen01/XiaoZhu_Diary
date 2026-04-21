"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/date";
import { queryKeys, useMemoryComments } from "@/lib/hooks/use-app-data";
import { memoryCommentSchema } from "@/lib/validation/schemas";
import type { Memory } from "@/lib/types";

type MemoryCommentValues = z.infer<typeof memoryCommentSchema>;

export function MemoryComments({ memory }: { memory: Memory }) {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { user } = useAuth();
  const commentsQuery = useMemoryComments(memory.id);

  const form = useForm<MemoryCommentValues>({
    resolver: zodResolver(memoryCommentSchema),
    defaultValues: {
      content: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: (values: MemoryCommentValues) =>
      repository.addMemoryComment(user!.id, {
        memoryId: memory.id,
        spaceId: memory.spaceId,
        content: values.content
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.memoryComments(memory.id)
      });
      form.reset({ content: "" });
      toast.success("评论已发表");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "发表评论失败");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => repository.deleteMemoryComment(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.memoryComments(memory.id)
      });
      toast.success("评论已删除");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "删除评论失败");
    }
  });

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>评论</CardTitle>
        <CardDescription>
          可以在这条回忆下面补一句当时的感受，双方看到的是同一条评论区。
        </CardDescription>
      </div>

      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(
          (values) => createMutation.mutate(values),
          () => toast.error(form.formState.errors.content?.message ?? "请先写一点内容")
        )}
      >
        <Textarea
          placeholder="比如：那天其实我还想再多待一会儿。"
          className="min-h-[110px]"
          {...form.register("content")}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-destructive">
            {form.formState.errors.content?.message}
          </p>
          <Button type="submit" disabled={createMutation.isPending}>
            发表评论
          </Button>
        </div>
      </form>

      {commentsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">正在读取评论...</p>
      ) : null}
      {commentsQuery.error ? (
        <p className="text-sm text-destructive">
          {commentsQuery.error instanceof Error
            ? commentsQuery.error.message
            : "读取评论失败"}
        </p>
      ) : null}

      {commentsQuery.data?.length ? (
        <div className="space-y-3">
          {commentsQuery.data.map((comment) => (
            <div
              key={comment.id}
              className="space-y-3 rounded-3xl border border-border/80 bg-secondary/30 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={comment.authorProfile?.nickname}
                    src={comment.authorProfile?.avatarUrl}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {comment.authorProfile?.nickname ?? "未知"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </div>
                </div>

                {comment.createdBy === user?.id ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("确认删除这条评论吗？")) {
                        deleteMutation.mutate(comment.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                ) : null}
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : !commentsQuery.isLoading ? (
        <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-4 py-5 text-sm text-muted-foreground">
          还没有评论，先留下一句你们当时的想法吧。
        </div>
      ) : null}
    </Card>
  );
}
