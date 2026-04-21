"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, PencilLine, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/date";
import type { Memory } from "@/lib/types";
import { cn } from "@/lib/utils";

import { MemoryComments } from "./memory-comments";

export function MemoryDetail({ memory }: { memory: Memory }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { user } = useAuth();

  const deleteMutation = useMutation({
    mutationFn: () => repository.deleteMemory(memory.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("回忆已删除");
      router.push("/timeline");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  });

  const canEdit = memory.visibility === "space" || memory.createdBy === user?.id;

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{memory.title}</CardTitle>
              <Badge variant="subtle">{memory.category}</Badge>
              {memory.isStarred ? (
                <Badge variant="accent" className="gap-1">
                  <Star className="h-3 w-3" />
                  重要回忆
                </Badge>
              ) : null}
              {memory.visibility === "private" ? (
                <Badge variant="outline">仅自己可见</Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDate(memory.date)}
                {memory.time ? ` ${memory.time}` : ""}
              </span>
              {memory.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {memory.location}
                </span>
              ) : null}
            </div>
          </div>

          {canEdit ? (
            <div className="flex gap-2">
              <Link
                href={`/memories/${memory.id}/edit`}
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                <PencilLine className="h-4 w-4" />
                编辑
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  const confirmed = window.confirm("删除后无法恢复，确定删除这条记录吗？");
                  if (confirmed) deleteMutation.mutate();
                }}
              >
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            </div>
          ) : null}
        </div>

        <CardDescription className="whitespace-pre-wrap text-base leading-8 text-foreground">
          {memory.content.trim() || "这条回忆暂时只保留了标题，正文还没补上。"}
        </CardDescription>
      </Card>

      {memory.photos.length ? (
        <Card className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {memory.photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={memory.title}
                className="max-h-[360px] w-full rounded-3xl object-cover"
              />
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {memory.moodTags.map((tag) => (
            <Badge key={tag} variant="subtle">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
            <Avatar
              fallback={memory.createdByProfile?.nickname}
              src={memory.createdByProfile?.avatarUrl}
            />
            <div>
              <p className="text-sm font-medium">创建人</p>
              <p className="text-xs text-muted-foreground">
                {memory.createdByProfile?.nickname ?? "未知"} ·{" "}
                {formatDateTime(memory.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
            <Avatar
              fallback={memory.updatedByProfile?.nickname}
              src={memory.updatedByProfile?.avatarUrl}
            />
            <div>
              <p className="text-sm font-medium">最近编辑</p>
              <p className="text-xs text-muted-foreground">
                {memory.updatedByProfile?.nickname ?? "未知"} ·{" "}
                {formatDateTime(memory.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <MemoryComments memory={memory} />
    </div>
  );
}
