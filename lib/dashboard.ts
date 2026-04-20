import { addYears, differenceInCalendarDays, parseISO, startOfDay } from "date-fns";

import type {
  Anniversary,
  Memory,
  NoteCard,
  ReminderItem,
  WishlistItem
} from "@/lib/types";

export function getUpcomingAnniversaries(anniversaries: Anniversary[]) {
  const today = startOfDay(new Date());
  return anniversaries
    .map((item) => {
      const rawDate = parseISO(item.date);
      const nextOccurrence =
        item.repeatRule === "yearly"
          ? (() => {
              const currentYear = new Date().getFullYear();
              const thisYear = new Date(
                currentYear,
                rawDate.getMonth(),
                rawDate.getDate()
              );
              return thisYear >= today ? thisYear : addYears(thisYear, 1);
            })()
          : rawDate;

      return {
        ...item,
        nextOccurrence: nextOccurrence.toISOString(),
        daysLeft: differenceInCalendarDays(nextOccurrence, today)
      };
    })
    .filter((item) => item.daysLeft >= -7)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getWishlistProgress(wishes: WishlistItem[]) {
  const total = wishes.length;
  const completed = wishes.filter((item) => item.status === "completed").length;
  return {
    total,
    completed,
    ratio: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}

export function buildReminders(params: {
  anniversaries: Anniversary[];
  wishes: WishlistItem[];
  memories: Memory[];
}): ReminderItem[] {
  const reminders: ReminderItem[] = [];
  const upcomingAnniversaries = getUpcomingAnniversaries(params.anniversaries).slice(0, 3);

  upcomingAnniversaries.forEach((item) => {
    reminders.push({
      id: `anniversary-${item.id}`,
      title: `${item.title}快到了`,
      description:
        item.daysLeft === 0
          ? "就是今天。"
          : `${item.daysLeft} 天后到来，提前准备会更从容。`,
      dueAt: item.nextOccurrence,
      type: item.kind === "birthday" ? "birthday" : "anniversary"
    });
  });

  params.wishes
    .filter((wish) => wish.status === "pending" && wish.targetDate)
    .map((wish) => ({
      wish,
      daysLeft: differenceInCalendarDays(parseISO(wish.targetDate!), new Date())
    }))
    .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 2)
    .forEach(({ wish, daysLeft }) => {
      reminders.push({
        id: `wish-${wish.id}`,
        title: `${wish.title}临近了`,
        description: daysLeft === 0 ? "就是今天。" : `目标日还有 ${daysLeft} 天。`,
        dueAt: wish.targetDate!,
        type: "wishlist"
      });
    });

  const newestMemory = params.memories[0];
  if (newestMemory) {
    const daysSince = differenceInCalendarDays(new Date(), parseISO(newestMemory.date));
    if (daysSince >= 21) {
      reminders.push({
        id: "inactive",
        title: "已经有一段时间没新增回忆了",
        description: "如果最近也有值得留下的小事，可以补记一下。",
        type: "inactive"
      });
    }
  }

  return reminders.slice(0, 4);
}

export function pickDisplayNote(notes: NoteCard[]) {
  if (!notes.length) return null;
  const pinned = notes.find((note) => note.isPinned && !note.hideFromHomepage);
  if (pinned) return pinned;
  const visible = notes.filter((note) => !note.hideFromHomepage);
  return visible[Math.floor(Math.random() * visible.length)] ?? null;
}

export function getFeaturedMemories(memories: Memory[]) {
  const starred = memories.filter((memory) => memory.isStarred);
  return (starred.length ? starred : memories).slice(0, 2);
}
