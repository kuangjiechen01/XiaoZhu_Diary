"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pin, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell/page-header";
import { NoteForm } from "@/components/forms/note-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useNotes } from "@/lib/hooks/use-app-data";
import { useRepository } from "@/components/providers/repository-provider";
import type { NoteCard } from "@/lib/types";

export default function NotesPage() {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const [editing, setEditing] = useState<NoteCard | null>(null);
  const notesQuery = useNotes();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.deleteNote(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("留言已删除");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="留言 / 小纸条"
        description="适合留下一句话、一个提醒、一个想法。可置顶、可私密、也可选择不在首页展示。"
      />
      <NoteForm note={editing} onDone={() => setEditing(null)} />
      {notesQuery.isLoading ? <LoadingPanel label="正在读取留言..." /> : null}
      {notesQuery.error ? (
        <ErrorPanel
          description={
            notesQuery.error instanceof Error
              ? notesQuery.error.message
              : "读取留言失败"
          }
        />
      ) : null}
      {notesQuery.data?.length ? (
        <div className="space-y-3">
          {notesQuery.data.map((note) => (
            <Card key={note.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {note.isPinned ? (
                      <Badge variant="accent" className="gap-1">
                        <Pin className="h-3 w-3" />
                        置顶
                      </Badge>
                    ) : null}
                    {note.visibility === "private" ? (
                      <Badge variant="outline">仅自己可见</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm leading-8">{note.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar
                      className="h-7 w-7"
                      fallback={note.authorProfile?.nickname}
                      src={note.authorProfile?.avatarUrl}
                    />
                    {note.authorProfile?.nickname ?? "我"} ·{" "}
                    {new Date(note.createdAt).toLocaleString("zh-CN")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(note)}>
                    <PencilLine className="h-4 w-4" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("确认删除这张纸条吗？")) {
                        deleteMutation.mutate(note.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !notesQuery.isLoading ? (
        <EmptyState
          title="还没有留言"
          description="写一句今天想留给彼此的话吧。"
        />
      ) : null}
    </div>
  );
}
