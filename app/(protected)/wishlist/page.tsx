"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CheckCircle2, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { WishlistForm } from "@/components/forms/wishlist-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { formatDate } from "@/lib/date";
import { useWishlist } from "@/lib/hooks/use-app-data";
import { useRepository } from "@/components/providers/repository-provider";
import { cn } from "@/lib/utils";
import type { WishlistItem } from "@/lib/types";

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { user } = useAuth();
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const wishlistQuery = useWishlist();

  const pending = useMemo(
    () => (wishlistQuery.data ?? []).filter((item) => item.status === "pending"),
    [wishlistQuery.data]
  );
  const completed = useMemo(
    () => (wishlistQuery.data ?? []).filter((item) => item.status === "completed"),
    [wishlistQuery.data]
  );

  const completeMutation = useMutation({
    mutationFn: (id: string) => repository.completeWishlist(user!.id, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("愿望已标记为完成");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "更新失败");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.deleteWishlist(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("愿望已删除");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="共同愿望清单"
        description="记录未来想一起做的事，完成后可以一键转为回忆记录。"
      />
      <WishlistForm wishlist={editing} onDone={() => setEditing(null)} />

      {wishlistQuery.isLoading ? <LoadingPanel label="正在读取愿望清单..." /> : null}
      {wishlistQuery.error ? (
        <ErrorPanel
          description={
            wishlistQuery.error instanceof Error
              ? wishlistQuery.error.message
              : "读取愿望失败"
          }
        />
      ) : null}

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medium">完成进度</p>
          <Badge variant="subtle">
            {completed.length}/{(wishlistQuery.data ?? []).length}
          </Badge>
        </div>
        <div className="h-3 rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${
                wishlistQuery.data?.length
                  ? Math.round((completed.length / wishlistQuery.data.length) * 100)
                  : 0
              }%`
            }}
          />
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">进行中</h2>
        {pending.length ? (
          pending.map((item) => (
            <Card key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="subtle">{item.category}</Badge>
                    {item.visibility === "private" ? (
                      <Badge variant="outline">仅自己可见</Badge>
                    ) : null}
                  </div>
                  {item.note ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.targetDate ? `目标日：${formatDate(item.targetDate)}` : "未设置目标日"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(item)}>
                    <PencilLine className="h-4 w-4" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("确认标记为已完成吗？")) {
                        completeMutation.mutate(item.id);
                      }
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    完成
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            title="暂时没有进行中的愿望"
            description="把想一起做的事情记进来，完成后再转成回忆。"
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">已完成</h2>
        {completed.length ? (
          completed.map((item) => (
            <Card key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="accent">已完成</Badge>
                  </div>
                  {item.note ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    完成于 {item.completedAt ? formatDate(item.completedAt) : "最近"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/memories/new?fromWish=${item.id}`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    转成回忆
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setEditing(item)}>
                    <PencilLine className="h-4 w-4" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("确认删除这个愿望吗？")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            title="还没有完成的愿望"
            description="完成后会自动累积成很有成就感的一页。"
          />
        )}
      </section>
    </div>
  );
}
