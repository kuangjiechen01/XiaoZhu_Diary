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
import { queryKeys } from "@/lib/hooks/use-app-data";
import { anniversarySchema } from "@/lib/validation/schemas";
import type { Anniversary } from "@/lib/types";

type AnniversaryValues = z.infer<typeof anniversarySchema>;

export function AnniversaryForm({
  anniversary,
  onDone
}: {
  anniversary?: Anniversary | null;
  onDone?: () => void;
}) {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { profile, user } = useAuth();

  const form = useForm<AnniversaryValues>({
    resolver: zodResolver(anniversarySchema),
    defaultValues: {
      title: "",
      kind: "custom",
      date: new Date().toISOString().slice(0, 10),
      repeatRule: "yearly",
      sortOrder: 0,
      reminderEnabled: true,
      visibility: "space"
    }
  });

  useEffect(() => {
    form.reset({
      title: anniversary?.title ?? "",
      kind: anniversary?.kind ?? "custom",
      date: anniversary?.date ?? new Date().toISOString().slice(0, 10),
      repeatRule: anniversary?.repeatRule ?? "yearly",
      sortOrder: anniversary?.sortOrder ?? 0,
      reminderEnabled: anniversary?.reminderEnabled ?? true,
      visibility: anniversary?.visibility ?? "space"
    });
  }, [anniversary, form]);

  const saveMutation = useMutation({
    mutationFn: (values: AnniversaryValues) =>
      repository.saveAnniversary(user!.id, {
        id: anniversary?.id,
        spaceId: profile!.primarySpaceId!,
        title: values.title,
        kind: values.kind,
        date: values.date,
        repeatRule: values.repeatRule,
        sortOrder: values.sortOrder,
        reminderEnabled: values.reminderEnabled,
        visibility: values.visibility
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.anniversaries(profile?.primarySpaceId ?? undefined)
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.activities(profile?.primarySpaceId ?? undefined)
        })
      ]);
      toast.success(anniversary ? "纪念日已更新" : "纪念日已添加");
      onDone?.();
      form.reset({
        title: "",
        kind: "custom",
        date: new Date().toISOString().slice(0, 10),
        repeatRule: "yearly",
        sortOrder: 0,
        reminderEnabled: true,
        visibility: "space"
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  });

  return (
    <Card className="space-y-4">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(
          (values) => saveMutation.mutate(values),
          () => toast.error("请先补全纪念日信息")
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="anniversary-title">名称</Label>
            <Input id="anniversary-title" {...form.register("title")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.title?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary-kind">类型</Label>
            <Select id="anniversary-kind" {...form.register("kind")}>
              <option value="relationship_start">恋爱开始日</option>
              <option value="birthday">生日</option>
              <option value="first_meet">第一次见面</option>
              <option value="first_trip">第一次旅行</option>
              <option value="custom">自定义</option>
            </Select>
            <p className="text-xs text-destructive">
              {form.formState.errors.kind?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary-date">日期</Label>
            <Input id="anniversary-date" type="date" {...form.register("date")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.date?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary-repeat">重复规则</Label>
            <Select id="anniversary-repeat" {...form.register("repeatRule")}>
              <option value="yearly">每年重复</option>
              <option value="once">仅一次</option>
            </Select>
            <p className="text-xs text-destructive">
              {form.formState.errors.repeatRule?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary-sort">排序</Label>
            <Input id="anniversary-sort" type="number" min={0} max={99} {...form.register("sortOrder")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.sortOrder?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary-visibility">可见性</Label>
            <Select id="anniversary-visibility" {...form.register("visibility")}>
              <option value="space">双方可见</option>
              <option value="private">仅自己可见</option>
            </Select>
            <p className="text-xs text-destructive">
              {form.formState.errors.visibility?.message}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 text-sm">
          <input type="checkbox" {...form.register("reminderEnabled")} />
          开启提醒
        </label>
        <div className="flex gap-3">
          <Button className="flex-1" disabled={saveMutation.isPending} type="submit">
            {anniversary ? "保存修改" : "添加纪念日"}
          </Button>
          {anniversary ? (
            <Button className="flex-1" type="button" variant="secondary" onClick={() => onDone?.()}>
              取消编辑
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
