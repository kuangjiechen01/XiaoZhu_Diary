"use client";

import { PageHeader } from "@/components/app-shell/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useActivities } from "@/lib/hooks/use-app-data";

export default function ActivityPage() {
  const activitiesQuery = useActivities(50);

  return (
    <div className="space-y-5">
      <PageHeader
        title="最近动态"
        description="让你们知道最近是谁新增了什么、编辑了什么、完成了什么。"
      />
      {activitiesQuery.isLoading ? <LoadingPanel label="正在读取最近动态..." /> : null}
      {activitiesQuery.error ? (
        <ErrorPanel
          description={
            activitiesQuery.error instanceof Error
              ? activitiesQuery.error.message
              : "读取最近动态失败"
          }
        />
      ) : null}
      {activitiesQuery.data?.length ? (
        <div className="space-y-3">
          {activitiesQuery.data.map((activity) => (
            <Card key={activity.id} className="space-y-3">
              <div className="flex gap-3">
                <Avatar
                  fallback={activity.actorProfile?.nickname}
                  src={activity.actorProfile?.avatarUrl}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {activity.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !activitiesQuery.isLoading ? (
        <EmptyState
          title="还没有最近动态"
          description="当你们开始共同记录后，这里会显示双方最近的新增和编辑。"
        />
      ) : null}
    </div>
  );
}
