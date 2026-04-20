"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell/page-header";
import { MemoryFilters } from "@/components/memories/memory-filters";
import { MemoryCard } from "@/components/memories/memory-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMemories, useSpaceMembers } from "@/lib/hooks/use-app-data";
import type { SearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({ category: "全部" });
  const membersQuery = useSpaceMembers();
  const memoriesQuery = useMemories(filters);

  return (
    <div className="space-y-5">
      <PageHeader
        title="全局搜索"
        description="重点支持长期可检索：标题、正文、地点、标签、分类、日期范围、创建人、重要程度、是否有图片。"
        action={
          <Link href="/memories/new" className={cn(buttonVariants({ variant: "default" }))}>
            新建回忆
          </Link>
        }
      />

      <MemoryFilters
        filters={filters}
        members={membersQuery.data ?? []}
        onChange={setFilters}
      />

      {memoriesQuery.isLoading ? <LoadingPanel label="正在搜索..." /> : null}
      {memoriesQuery.error ? (
        <ErrorPanel
          description={
            memoriesQuery.error instanceof Error
              ? memoriesQuery.error.message
              : "搜索失败"
          }
        />
      ) : null}

      <div className="text-sm text-muted-foreground">
        共找到 {memoriesQuery.data?.length ?? 0} 条记录
      </div>

      {memoriesQuery.data?.length ? (
        <div className="space-y-3">
          {memoriesQuery.data.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : !memoriesQuery.isLoading ? (
        <EmptyState
          title="没有搜到结果"
          description="换一个关键词，或减少筛选条件再试试。"
        />
      ) : null}
    </div>
  );
}
