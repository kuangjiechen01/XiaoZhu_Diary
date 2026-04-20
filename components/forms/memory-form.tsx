"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/lib/hooks/use-app-data";
import { memorySchema } from "@/lib/validation/schemas";
import { memoryCategories, moodTags, type Memory } from "@/lib/types";
import { cn } from "@/lib/utils";

import { PhotoUploadField } from "./photo-upload-field";

type MemoryFormValues = z.infer<typeof memorySchema>;

export function MemoryForm({
  memory,
  preset
}: {
  memory?: Memory | null;
  preset?: Partial<Pick<Memory, "title" | "content" | "category" | "date">>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { user, profile } = useAuth();

  const defaults = useMemo<MemoryFormValues>(
    () => ({
      title: memory?.title ?? preset?.title ?? "",
      content: memory?.content ?? preset?.content ?? "",
      date:
        memory?.date ??
        preset?.date ??
        new Date().toISOString().slice(0, 10),
      time: memory?.time ?? "",
      location: memory?.location ?? "",
      category: memory?.category ?? preset?.category ?? "日常碎片",
      moodTags: memory?.moodTags ?? [],
      visibility: memory?.visibility ?? "space",
      isStarred: memory?.isStarred ?? false,
      photos: memory?.photos ?? []
    }),
    [memory, preset]
  );

  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    values: defaults
  });

  const membersQuery = useQuery({
    queryKey: queryKeys.members(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId),
    queryFn: () => repository.getSpaceMembers(profile!.primarySpaceId!)
  });

  const saveMutation = useMutation({
    mutationFn: (values: MemoryFormValues) =>
      repository.saveMemory(user!.id, {
        id: memory?.id,
        spaceId: profile!.primarySpaceId!,
        title: values.title,
        content: values.content,
        date: values.date,
        time: values.time || null,
        location: values.location || null,
        category: values.category,
        moodTags: values.moodTags,
        photos: values.photos,
        isStarred: values.isStarred,
        visibility: values.visibility
      }),
    onSuccess: async (savedMemory) => {
      await queryClient.invalidateQueries();
      toast.success(memory ? "回忆已更新" : "回忆已保存");
      router.push(`/memories/${savedMemory.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  });

  const toggleMood = (tag: string) => {
    const current = form.getValues("moodTags");
    const next = current.includes(tag as any)
      ? current.filter((item) => item !== tag)
      : [...current, tag as any].slice(0, 5);
    form.setValue("moodTags", next, { shouldValidate: true });
  };

  const handleSubmit = form.handleSubmit((values) => saveMutation.mutate(values));

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Card className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="memory-title">标题</Label>
            <Input id="memory-title" {...form.register("title")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.title?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-content">正文</Label>
            <Textarea id="memory-content" {...form.register("content")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.content?.message}
            </p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="memory-date">日期</Label>
            <Input id="memory-date" type="date" {...form.register("date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-time">时间（可选）</Label>
            <Input id="memory-time" type="time" {...form.register("time")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-location">地点（可选）</Label>
            <Input id="memory-location" {...form.register("location")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-category">分类</Label>
            <Select id="memory-category" {...form.register("category")}>
              {memoryCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>心情标签</Label>
          <div className="flex flex-wrap gap-2">
            {moodTags.map((tag) => {
              const active = form.watch("moodTags").includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleMood(tag)}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="memory-visibility">可见性</Label>
            <Select id="memory-visibility" {...form.register("visibility")}>
              <option value="space">双方可见</option>
              <option value="private">仅自己可见</option>
            </Select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 text-sm">
            <input type="checkbox" {...form.register("isStarred")} />
            设为重要回忆
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-2">
          <Label>照片</Label>
          <PhotoUploadField
            photos={form.watch("photos")}
            onChange={(photos) =>
              form.setValue("photos", photos, { shouldDirty: true, shouldValidate: true })
            }
          />
        </div>
      </Card>

      <Card className="space-y-3 bg-muted/60">
        <p className="text-sm leading-7 text-muted-foreground">
          编辑规则：双方可见内容默认双方都能编辑；如果两人同时编辑同一条记录，采用最后保存为准。
          详情页会展示最近编辑人和更新时间。
        </p>
        {memory?.updatedByProfile ? (
          <p className="text-xs text-muted-foreground">
            最近由 {memory.updatedByProfile.nickname} 编辑于 {memory.updatedAt.slice(0, 16)}
          </p>
        ) : null}
        {membersQuery.data?.length ? (
          <p className="text-xs text-muted-foreground">
            当前已绑定：{membersQuery.data.map((item) => item.profile?.nickname).join(" / ")}
          </p>
        ) : null}
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1" disabled={saveMutation.isPending} type="submit">
          {memory ? "保存修改" : "创建回忆"}
        </Button>
        <Link
          href={memory ? `/memories/${memory.id}` : "/timeline"}
          className={cn(buttonVariants({ variant: "secondary" }), "flex-1")}
        >
          取消
        </Link>
      </div>
    </form>
  );
}
