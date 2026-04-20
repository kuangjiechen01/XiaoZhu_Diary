"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { wishlistSchema } from "@/lib/validation/schemas";
import type { WishlistItem } from "@/lib/types";

type WishlistValues = z.infer<typeof wishlistSchema>;

export function WishlistForm({
  wishlist,
  onDone
}: {
  wishlist?: WishlistItem | null;
  onDone?: () => void;
}) {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { profile, user } = useAuth();

  const form = useForm<WishlistValues>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      title: "",
      note: "",
      category: "旅行",
      targetDate: "",
      status: "pending",
      visibility: "space"
    }
  });

  useEffect(() => {
    form.reset({
      title: wishlist?.title ?? "",
      note: wishlist?.note ?? "",
      category: wishlist?.category ?? "旅行",
      targetDate: wishlist?.targetDate ?? "",
      status: wishlist?.status ?? "pending",
      visibility: wishlist?.visibility ?? "space"
    });
  }, [form, wishlist]);

  const saveMutation = useMutation({
    mutationFn: (values: WishlistValues) =>
      repository.saveWishlist(user!.id, {
        id: wishlist?.id,
        spaceId: profile!.primarySpaceId!,
        title: values.title,
        note: values.note || null,
        category: values.category,
        targetDate: values.targetDate || null,
        status: values.status,
        visibility: values.visibility,
        completedAt: values.status === "completed" ? new Date().toISOString() : null
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success(wishlist ? "愿望已更新" : "愿望已添加");
      onDone?.();
      form.reset({
        title: "",
        note: "",
        category: "旅行",
        targetDate: "",
        status: "pending",
        visibility: "space"
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  });

  return (
    <Card className="space-y-4">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="wishlist-title">标题</Label>
            <Input id="wishlist-title" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wishlist-category">分类</Label>
            <Input id="wishlist-category" {...form.register("category")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wishlist-targetDate">目标日期（可选）</Label>
            <Input id="wishlist-targetDate" type="date" {...form.register("targetDate")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wishlist-note">备注</Label>
          <Textarea id="wishlist-note" rows={4} {...form.register("note")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wishlist-status">状态</Label>
            <Select id="wishlist-status" {...form.register("status")}>
              <option value="pending">未完成</option>
              <option value="completed">已完成</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wishlist-visibility">可见性</Label>
            <Select id="wishlist-visibility" {...form.register("visibility")}>
              <option value="space">双方可见</option>
              <option value="private">仅自己可见</option>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" disabled={saveMutation.isPending} type="submit">
            {wishlist ? "保存修改" : "添加愿望"}
          </Button>
          {wishlist ? (
            <Button className="flex-1" type="button" variant="secondary" onClick={() => onDone?.()}>
              取消编辑
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
