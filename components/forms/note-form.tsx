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
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/lib/hooks/use-app-data";
import { noteSchema } from "@/lib/validation/schemas";
import type { NoteCard } from "@/lib/types";

type NoteValues = z.infer<typeof noteSchema>;

export function NoteForm({
  note,
  onDone
}: {
  note?: NoteCard | null;
  onDone?: () => void;
}) {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { profile, user } = useAuth();

  const form = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
      visibility: "space",
      isPinned: false,
      hideFromHomepage: false
    }
  });

  useEffect(() => {
    form.reset({
      content: note?.content ?? "",
      visibility: note?.visibility ?? "space",
      isPinned: note?.isPinned ?? false,
      hideFromHomepage: note?.hideFromHomepage ?? false
    });
  }, [form, note]);

  const saveMutation = useMutation({
    mutationFn: (values: NoteValues) =>
      repository.saveNote(user!.id, {
        id: note?.id,
        spaceId: profile!.primarySpaceId!,
        content: values.content.trim(),
        visibility: values.visibility,
        isPinned: values.isPinned,
        hideFromHomepage: values.hideFromHomepage
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.notes(profile?.primarySpaceId ?? undefined)
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.activities(profile?.primarySpaceId ?? undefined)
        })
      ]);
      toast.success(note ? "留言已更新" : "留言已保存");
      onDone?.();
      form.reset({
        content: "",
        visibility: "space",
        isPinned: false,
        hideFromHomepage: false
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  });

  return (
    <Card className="space-y-4">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(
          (values) => saveMutation.mutate(values),
          (errors) => {
            const firstMessage = Object.values(errors)[0]?.message;
            toast.error(typeof firstMessage === "string" ? firstMessage : "请先检查留言内容");
          }
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="note-content">想说的话</Label>
          <Textarea
            id="note-content"
            rows={4}
            placeholder="写一句今天想留给对方的话，或者一个小提醒。"
            {...form.register("content")}
          />
          <p className="text-xs text-muted-foreground">当前适合写短留言，最多 280 个字。</p>
          <p className="text-xs text-destructive">{form.formState.errors.content?.message}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="note-visibility">可见性</Label>
            <Select id="note-visibility" {...form.register("visibility")}>
              <option value="space">双方可见</option>
              <option value="private">仅自己可见</option>
            </Select>
            <p className="text-xs text-destructive">{form.formState.errors.visibility?.message}</p>
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 text-sm">
              <input type="checkbox" {...form.register("isPinned")} />
              置顶
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 text-sm">
              <input type="checkbox" {...form.register("hideFromHomepage")} />
              不在首页展示
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" disabled={saveMutation.isPending} type="submit">
            {note ? "保存修改" : "写下这句话"}
          </Button>
          {note ? (
            <Button className="flex-1" type="button" variant="secondary" onClick={() => onDone?.()}>
              取消编辑
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
