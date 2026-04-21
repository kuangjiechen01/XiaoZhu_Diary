"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  CalendarClock,
  CheckCircle2,
  MessageCircleHeart,
  Sparkles
} from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import {
  buildReminders,
  getFeaturedMemories,
  getUpcomingAnniversaries,
  getWishlistProgress,
  pickDisplayNote
} from "@/lib/dashboard";
import { daysTogether, formatCountdown, formatDate } from "@/lib/date";
import {
  useActivities,
  useAnniversaries,
  useCurrentSpace,
  useMemories,
  useNotes,
  useSpaceMembers,
  useWishlist
} from "@/lib/hooks/use-app-data";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const { profile } = useAuth();
  const spaceQuery = useCurrentSpace();
  const membersQuery = useSpaceMembers();
  const memoriesQuery = useMemories();
  const anniversariesQuery = useAnniversaries();
  const notesQuery = useNotes();
  const wishlistQuery = useWishlist();
  const activitiesQuery = useActivities(8);

  const loading =
    spaceQuery.isLoading ||
    membersQuery.isLoading ||
    memoriesQuery.isLoading ||
    anniversariesQuery.isLoading ||
    notesQuery.isLoading ||
    wishlistQuery.isLoading ||
    activitiesQuery.isLoading;

  if (loading && !spaceQuery.data) {
    return <LoadingPanel label="正在整理你们最近的生活记录..." />;
  }

  if (spaceQuery.error) {
    return (
      <ErrorPanel
        description={
          spaceQuery.error instanceof Error
            ? spaceQuery.error.message
            : "读取空间信息失败"
        }
      />
    );
  }

  const space = spaceQuery.data;
  const members = membersQuery.data ?? [];
  const memories = memoriesQuery.data ?? [];
  const anniversaries = anniversariesQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const wishes = wishlistQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];
  const upcoming = getUpcomingAnniversaries(anniversaries);
  const reminders = buildReminders({ anniversaries, wishes, memories });
  const noteOfDay = pickDisplayNote(notes);
  const featuredMemories = getFeaturedMemories(memories);
  const progress = getWishlistProgress(wishes);
  const relationshipDays = daysTogether(space?.startedOn);

  return (
    <div className="space-y-5">
      <PageHeader
        title="今天也把生活慢慢记下来"
        description="一眼看到最近发生了什么，也能很快补上一条新的记录。"
        action={
          <Link href="/memories/new" className={buttonVariants({ variant: "default" })}>
            新建回忆
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5 bg-paper-glow">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="accent">情侣空间概览</Badge>
              <CardTitle>{space?.name ?? "未命名空间"}</CardTitle>
              <CardDescription>
                {relationshipDays
                  ? `已经一起走过 ${relationshipDays} 天。`
                  : "可以在设置页补充恋爱开始日，首页会自动显示恋爱天数。"}
              </CardDescription>
            </div>
            <div className="flex -space-x-2">
              {members.map((member) => (
                <Avatar
                  key={member.id}
                  className="h-11 w-11 border-2 border-white"
                  fallback={member.profile?.nickname}
                  src={member.profile?.avatarUrl}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-sm text-muted-foreground">最近回忆</p>
              <p className="mt-2 text-2xl font-semibold">{memories.length}</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-sm text-muted-foreground">纪念日</p>
              <p className="mt-2 text-2xl font-semibold">{anniversaries.length}</p>
            </div>
            <div className="rounded-3xl bg-white/85 p-4">
              <p className="text-sm text-muted-foreground">愿望完成率</p>
              <p className="mt-2 text-2xl font-semibold">{progress.ratio}%</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/timeline"
              className="rounded-3xl border border-white/70 bg-white/85 p-4 transition hover:-translate-y-0.5"
            >
              <BookHeart className="h-4 w-4 text-primary" />
              <p className="mt-3 text-sm font-medium">翻看时间线</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                按月份倒序查看过去的记录。
              </p>
            </Link>
            <Link
              href="/search"
              className="rounded-3xl border border-white/70 bg-white/85 p-4 transition hover:-translate-y-0.5"
            >
              <CalendarClock className="h-4 w-4 text-primary" />
              <p className="mt-3 text-sm font-medium">精确检索</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                按分类、日期、创建人和图片筛选。
              </p>
            </Link>
            <Link
              href="/wishlist"
              className="rounded-3xl border border-white/70 bg-white/85 p-4 transition hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="mt-3 text-sm font-medium">看看愿望清单</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                想做的事情和已经完成的计划分开看。
              </p>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">最近纪念日</CardTitle>
              <Link href="/anniversaries" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                查看全部
              </Link>
            </div>
            {upcoming.length ? (
              upcoming.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-secondary/50 p-3 text-sm leading-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant="subtle">{formatCountdown(item.nextOccurrence)}</Badge>
                  </div>
                  <p className="text-muted-foreground">{formatDate(item.nextOccurrence)}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="还没有纪念日"
                description="先把恋爱开始日、生日或第一次见面的日子补上。"
                action={
                  <Link
                    href="/anniversaries"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    去添加
                  </Link>
                }
              />
            )}
          </Card>

          {noteOfDay ? (
            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircleHeart className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">今天想留给彼此的话</CardTitle>
              </div>
              <p className="text-sm leading-8">{noteOfDay.content}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar
                  className="h-6 w-6"
                  fallback={noteOfDay.authorProfile?.nickname}
                  src={noteOfDay.authorProfile?.avatarUrl}
                />
                {noteOfDay.authorProfile?.nickname ?? profile?.nickname}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">最近新增回忆</CardTitle>
            <Link href="/timeline" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              去时间线
            </Link>
          </div>
          {memories.length ? (
            memories.slice(0, 3).map((memory) => (
              <Link
                key={memory.id}
                href={`/memories/${memory.id}`}
                className="rounded-2xl bg-secondary/35 p-3 transition hover:bg-secondary/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{memory.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(memory.date)}
                      {memory.location ? ` · ${memory.location}` : ""}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="还没有共同回忆"
              description="先从最近一次吃饭、散步或旅行开始记。"
            />
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">最近动态</CardTitle>
            <Link href="/activity" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              查看更多
            </Link>
          </div>
          {activities.length ? (
            activities.map((activity) => (
              <div key={activity.id} className="rounded-2xl bg-secondary/35 p-3">
                <div className="flex items-start gap-3">
                  <Avatar
                    className="h-8 w-8"
                    fallback={activity.actorProfile?.nickname}
                    src={activity.actorProfile?.avatarUrl}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    {activity.description ? (
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="还没有最近动态"
              description="当你们开始记录回忆、愿望和纪念日后，这里会出现双方最近的更新。"
            />
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">愿望进度</CardTitle>
            <Badge variant="subtle">
              {progress.completed}/{progress.total}
            </Badge>
          </div>
          <div className="h-3 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress.ratio}%` }}
            />
          </div>
          <div className="space-y-3">
            {wishes.slice(0, 3).map((wish) => (
              <div
                key={wish.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/35 p-3"
              >
                <div>
                  <p className="font-medium">{wish.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {wish.targetDate ? formatDate(wish.targetDate) : "未设置目标日"}
                  </p>
                </div>
                <Badge variant={wish.status === "completed" ? "accent" : "default"}>
                  {wish.status === "completed" ? "已完成" : "进行中"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">温和提醒</CardTitle>
          </div>
          {reminders.length ? (
            reminders.map((item) => (
              <div key={item.id} className="rounded-2xl bg-secondary/35 p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="现在没有特别需要提醒的事"
              description="纪念日、生日和愿望目标日临近时，会在这里自然出现。"
            />
          )}
        </Card>
      </div>

      {featuredMemories.length ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">精选回忆</CardTitle>
            <Link href="/timeline" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              去回顾
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredMemories.map((memory) => (
              <Link
                href={`/memories/${memory.id}`}
                key={memory.id}
                className="overflow-hidden rounded-[28px] border border-white/70 bg-white/70"
              >
                {memory.photos[0] ? (
                  <img
                    src={memory.photos[0].url}
                    alt={memory.title}
                    className="h-44 w-full object-cover"
                  />
                ) : null}
                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{memory.title}</h3>
                    {memory.isStarred ? <Badge variant="accent">重要</Badge> : null}
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {memory.content.trim() || "这条回忆暂时只保留了标题。"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
