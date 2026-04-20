"use client";

import { useState } from "react";

import { PageHeader } from "@/components/app-shell/page-header";
import { MemoryFilters } from "@/components/memories/memory-filters";
import { MemoryTimeline } from "@/components/memories/memory-timeline";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMemories, useSpaceMembers } from "@/lib/hooks/use-app-data";
import type { SearchFilters } from "@/lib/types";

export default function TimelinePage() {
  const [filters, setFilters] = useState<SearchFilters>({ category: "全部" });
  const membersQuery = useSpaceMembers();
  const memoriesQuery = useMemories(filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="时间线"
        description="按时间倒序、按月份折叠查看，适合长期翻找和回顾。"
        action={<Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>筛选</Button>}
      />

      <MemoryFilters
        filters={filters}
        members={membersQuery.data ?? []}
        onChange={setFilters}
      />

      {memoriesQuery.isLoading ? <LoadingPanel label="正在整理时间线..." /> : null}
      {memoriesQuery.error ? (
        <ErrorPanel
          description={
            memoriesQuery.error instanceof Error
              ? memoriesQuery.error.message
              : "读取时间线失败"
          }
        />
      ) : null}
      {memoriesQuery.data?.length ? (
        <MemoryTimeline memories={memoriesQuery.data} />
      ) : !memoriesQuery.isLoading ? (
        <EmptyState
          title="没有找到符合条件的回忆"
          description="可以放宽筛选条件，或者现在就新建一条。"
        />
      ) : null}
    </div>
  );
}
