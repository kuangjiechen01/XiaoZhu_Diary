import {
  differenceInCalendarDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay
} from "date-fns";
import { zhCN } from "date-fns/locale";

import type { Memory } from "@/lib/types";

export function formatDate(input?: string | null, pattern = "yyyy.MM.dd") {
  if (!input) return "未设置";
  return format(parseISO(input), pattern, { locale: zhCN });
}

export function formatDateTime(input?: string | null) {
  if (!input) return "未更新";
  return format(parseISO(input), "yyyy.MM.dd HH:mm", { locale: zhCN });
}

export function formatMonth(input: string) {
  return format(parseISO(input), "yyyy 年 M 月", { locale: zhCN });
}

export function formatCountdown(date: string) {
  const today = startOfDay(new Date());
  const target = startOfDay(parseISO(date));
  const diff = differenceInCalendarDays(target, today);
  if (diff === 0) return "今天";
  if (diff > 0) return `${diff} 天后`;
  return `${Math.abs(diff)} 天前`;
}

export function daysTogether(startedOn?: string | null) {
  if (!startedOn) return null;
  return differenceInCalendarDays(startOfDay(new Date()), parseISO(startedOn)) + 1;
}

export function groupMemoriesByMonth(memories: Memory[]) {
  return memories.reduce<Record<string, Memory[]>>((acc, memory) => {
    const key = format(parseISO(memory.date), "yyyy-MM", { locale: zhCN });
    if (!acc[key]) acc[key] = [];
    acc[key].push(memory);
    return acc;
  }, {});
}

export function withinDateRange(
  target: string,
  startDate?: string,
  endDate?: string
) {
  const current = parseISO(target);
  if (startDate && isBefore(current, startOfDay(parseISO(startDate)))) return false;
  if (endDate && isAfter(current, endOfDay(parseISO(endDate)))) return false;
  return true;
}
