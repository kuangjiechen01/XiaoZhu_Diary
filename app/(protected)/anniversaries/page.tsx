"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell/page-header";
import { AnniversaryForm } from "@/components/forms/anniversary-form";
import { useRepository } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { getUpcomingAnniversaries } from "@/lib/dashboard";
import { formatCountdown, formatDate } from "@/lib/date";
import { useAnniversaries } from "@/lib/hooks/use-app-data";
import type { Anniversary } from "@/lib/types";

export default function AnniversariesPage() {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const anniversariesQuery = useAnniversaries();
  const nextMap = new Map(
    getUpcomingAnniversaries(anniversariesQuery.data ?? []).map((item) => [item.id, item])
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.deleteAnniversary(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("纪念日已删除");
      setEditing(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="纪念日"
        description="支持多个纪念日、提醒开关、重复规则和排序。首页会自动展示最近倒计时。"
      />
      <AnniversaryForm anniversary={editing} onDone={() => setEditing(null)} />
      {anniversariesQuery.isLoading ? <LoadingPanel label="正在读取纪念日..." /> : null}
      {anniversariesQuery.error ? (
        <ErrorPanel
          description={
            anniversariesQuery.error instanceof Error
              ? anniversariesQuery.error.message
              : "读取纪念日失败"
          }
        />
      ) : null}
      {anniversariesQuery.data?.length ? (
        <div className="space-y-3">
          {anniversariesQuery.data.map((item) => (
            <Card key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(item.date)} · {item.repeatRule === "yearly" ? "每年重复" : "仅一次"} ·{" "}
                    {item.reminderEnabled ? "提醒开启" : "提醒关闭"}
                  </p>
                  <p className="mt-2 text-sm">
                    {formatCountdown(nextMap.get(item.id)?.nextOccurrence ?? item.date)}
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
                      if (window.confirm("确认删除这个纪念日吗？")) {
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
          ))}
        </div>
      ) : !anniversariesQuery.isLoading ? (
        <EmptyState
          title="还没有纪念日"
          description="先把恋爱开始日、生日、第一次见面等关键节点补进来。"
        />
      ) : null}
    </div>
  );
}
