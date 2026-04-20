"use client";

import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { memoryCategories, type SearchFilters, type SpaceMember } from "@/lib/types";

export function MemoryFilters({
  filters,
  onChange,
  members
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  members: SpaceMember[];
}) {
  return (
    <Card className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="memory-search">关键词</Label>
          <Input
            id="memory-search"
            placeholder="搜索标题、正文、地点、标签"
            value={filters.q ?? ""}
            onChange={(event) => onChange({ ...filters, q: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memory-category">分类</Label>
          <Select
            id="memory-category"
            value={filters.category ?? "全部"}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target.value as SearchFilters["category"]
              })
            }
          >
            <option value="全部">全部分类</option>
            {memoryCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="memory-startDate">开始日期</Label>
          <Input
            id="memory-startDate"
            type="date"
            value={filters.startDate ?? ""}
            onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memory-endDate">结束日期</Label>
          <Input
            id="memory-endDate"
            type="date"
            value={filters.endDate ?? ""}
            onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memory-author">创建人</Label>
          <Select
            id="memory-author"
            value={filters.authorId ?? ""}
            onChange={(event) => onChange({ ...filters, authorId: event.target.value || undefined })}
          >
            <option value="">全部成员</option>
            {members.map((member) => (
              <option key={member.id} value={member.userId}>
                {member.profile?.nickname ?? member.userId}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex h-12 flex-1 items-center gap-2 rounded-2xl border border-input bg-card px-4 text-sm">
            <input
              checked={Boolean(filters.onlyStarred)}
              type="checkbox"
              onChange={(event) =>
                onChange({ ...filters, onlyStarred: event.target.checked || undefined })
              }
            />
            只看重要
          </label>
          <label className="flex h-12 flex-1 items-center gap-2 rounded-2xl border border-input bg-card px-4 text-sm">
            <input
              checked={Boolean(filters.withPhotos)}
              type="checkbox"
              onChange={(event) =>
                onChange({ ...filters, withPhotos: event.target.checked || undefined })
              }
            />
            仅有图片
          </label>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => onChange({ category: "全部" })}
      >
        <SearchX className="h-4 w-4" />
        清空筛选
      </Button>
    </Card>
  );
}
