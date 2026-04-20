"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { MemoryDetail } from "@/components/memories/memory-detail";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMemory } from "@/lib/hooks/use-app-data";

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>();
  const memoryQuery = useMemory(params.id);

  return (
    <div className="space-y-5">
      <PageHeader
        backHref="/timeline"
        title="回忆详情"
        description="查看完整内容、照片、创建人和最近编辑信息。"
      />
      {memoryQuery.isLoading ? <LoadingPanel label="正在读取这条回忆..." /> : null}
      {memoryQuery.error ? (
        <ErrorPanel
          description={
            memoryQuery.error instanceof Error
              ? memoryQuery.error.message
              : "读取回忆失败"
          }
        />
      ) : null}
      {memoryQuery.data ? (
        <MemoryDetail memory={memoryQuery.data} />
      ) : !memoryQuery.isLoading ? (
        <EmptyState
          title="没有找到这条回忆"
          description="它可能已被删除，或者你没有权限查看。"
        />
      ) : null}
    </div>
  );
}
