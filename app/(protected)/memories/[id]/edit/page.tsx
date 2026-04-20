"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { MemoryForm } from "@/components/forms/memory-form";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMemory } from "@/lib/hooks/use-app-data";

export default function EditMemoryPage() {
  const params = useParams<{ id: string }>();
  const memoryQuery = useMemory(params.id);

  return (
    <div className="space-y-5">
      <PageHeader
        backHref={`/memories/${params.id}`}
        title="编辑回忆"
        description="默认双方可编辑双方可见内容；同时编辑时采用最后保存为准。"
      />
      {memoryQuery.isLoading ? <LoadingPanel label="正在载入编辑内容..." /> : null}
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
        <MemoryForm memory={memoryQuery.data} />
      ) : !memoryQuery.isLoading ? (
        <EmptyState
          title="找不到这条回忆"
          description="它可能已经被删除，或你没有编辑权限。"
        />
      ) : null}
    </div>
  );
}
