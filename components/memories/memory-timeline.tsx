"use client";

import { groupMemoriesByMonth } from "@/lib/date";
import type { Memory } from "@/lib/types";

import { MemoryCard } from "./memory-card";

export function MemoryTimeline({ memories }: { memories: Memory[] }) {
  const groups = groupMemoriesByMonth(memories);
  const entries = Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {entries.map(([month, items], index) => (
        <details
          key={month}
          className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-card"
          open={index < 3}
        >
          <summary className="cursor-pointer list-none text-lg font-semibold">
            {month.replace("-", " 年 ")} 月
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {items.length} 条记录
            </span>
          </summary>
          <div className="mt-4 space-y-3">
            {items.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
