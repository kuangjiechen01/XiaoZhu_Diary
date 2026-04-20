"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorPanel } from "@/components/ui/error-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { Switch } from "@/components/ui/switch";
import { downloadJson } from "@/lib/utils";
import {
  useCurrentSpace,
  useInvitations,
  useSpaceMembers
} from "@/lib/hooks/use-app-data";
import {
  createSpaceSchema,
  profileSchema
} from "@/lib/validation/schemas";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const repository = useRepository();
  const { profile, refreshProfile, signOut, updateProfile, user } = useAuth();
  const spaceQuery = useCurrentSpace();
  const membersQuery = useSpaceMembers();
  const invitationsQuery = useInvitations();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      nickname: "",
      partnerLabel: "",
      bio: ""
    }
  });

  const spaceForm = useForm({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      startedOn: ""
    }
  });

  useEffect(() => {
    profileForm.reset({
      fullName: profile?.fullName ?? "",
      nickname: profile?.nickname ?? "",
      partnerLabel: profile?.partnerLabel ?? "",
      bio: profile?.bio ?? ""
    });
  }, [profile, profileForm]);

  useEffect(() => {
    spaceForm.reset({
      name: spaceQuery.data?.name ?? "",
      startedOn: spaceQuery.data?.startedOn ?? ""
    });
  }, [spaceForm, spaceQuery.data]);

  const inviteMutation = useMutation({
    mutationFn: () => repository.createInvitation(profile!.primarySpaceId!, user!.id),
    onSuccess: async (invitation) => {
      await queryClient.invalidateQueries();
      const inviteUrl = `${window.location.origin}/invite/${invitation.code}`;
      await navigator.clipboard.writeText(inviteUrl).catch(() => null);
      toast.success("邀请码已生成，链接已复制");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "生成邀请码失败");
    }
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      await updateProfile(values);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  });

  const saveSpaceMutation = useMutation({
    mutationFn: (values: any) =>
      repository.updateSpace({
        spaceId: profile!.primarySpaceId!,
        name: values.name,
        startedOn: values.startedOn || null
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("空间信息已保存");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    }
  });

  const leaveSpaceMutation = useMutation({
    mutationFn: () => repository.leaveSpace(user!.id, profile!.primarySpaceId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      await refreshProfile();
      toast.success("已解除绑定");
      window.location.href = "/onboarding";
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "解除绑定失败");
    }
  });

  const exportMutation = useMutation({
    mutationFn: () => repository.exportSpaceData(profile!.primarySpaceId!, user!.id),
    onSuccess: (data) => {
      downloadJson(
        `shared-space-export-${new Date().toISOString().slice(0, 10)}.json`,
        data
      );
      toast.success("数据已导出为 JSON");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "导出失败");
    }
  });

  if (spaceQuery.isLoading || membersQuery.isLoading || invitationsQuery.isLoading) {
    return <LoadingPanel label="正在读取设置..." />;
  }

  if (spaceQuery.error) {
    return (
      <ErrorPanel
        description={
          spaceQuery.error instanceof Error
            ? spaceQuery.error.message
            : "读取设置失败"
        }
      />
    );
  }

  const members = membersQuery.data ?? [];
  const partner = members.find((member) => member.userId !== user?.id)?.profile;
  const invitations = invitationsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="设置"
        description="管理个人信息、伴侣信息、空间状态、邀请码、提醒开关和数据导出。"
      />

      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">个人信息</CardTitle>
          <CardDescription>这些信息都可以随时修改，不会写死在代码里。</CardDescription>
        </div>
        <form
          className="space-y-4"
          onSubmit={profileForm.handleSubmit((values) => saveProfileMutation.mutate(values))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-nickname">昵称</Label>
              <Input id="profile-nickname" {...profileForm.register("nickname")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-fullName">姓名</Label>
              <Input id="profile-fullName" {...profileForm.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-partnerLabel">你对对方的称呼</Label>
              <Input id="profile-partnerLabel" {...profileForm.register("partnerLabel")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-bio">简介</Label>
              <Input id="profile-bio" {...profileForm.register("bio")} />
            </div>
          </div>
          <Button type="submit" disabled={saveProfileMutation.isPending}>
            保存个人信息
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">伴侣信息</CardTitle>
          <CardDescription>这里展示当前与你绑定的另一位成员。</CardDescription>
        </div>
        {partner ? (
          <div className="flex items-center gap-4 rounded-3xl bg-secondary/35 p-4">
            <Avatar
              className="h-12 w-12"
              fallback={partner.nickname}
              src={partner.avatarUrl}
            />
            <div>
              <p className="font-medium">{partner.nickname}</p>
              <p className="text-sm text-muted-foreground">{partner.fullName}</p>
              {partner.bio ? (
                <p className="mt-1 text-sm text-muted-foreground">{partner.bio}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyState
            title="还没有绑定另一位成员"
            description="生成邀请码后，把链接发给对方加入。"
          />
        )}
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">空间信息</CardTitle>
          <CardDescription>可修改空间名称和恋爱开始日。</CardDescription>
        </div>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={spaceForm.handleSubmit((values) => saveSpaceMutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="space-name">空间名称</Label>
            <Input id="space-name" {...spaceForm.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="space-startedOn">恋爱开始日</Label>
            <Input id="space-startedOn" type="date" {...spaceForm.register("startedOn")} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saveSpaceMutation.isPending}>
              保存空间信息
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">绑定状态与邀请码</CardTitle>
          <CardDescription>
            当前空间成员 {members.length}/2。邀请码默认 72 小时有效。
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <Badge key={member.id} variant="subtle">
              {member.profile?.nickname ?? member.userId} · {member.role}
            </Badge>
          ))}
        </div>
        <Button onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending}>
          生成邀请码并复制链接
        </Button>
        {invitations.length ? (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-2xl bg-secondary/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{invitation.code}</p>
                  <Badge variant={invitation.status === "pending" ? "accent" : "subtle"}>
                    {invitation.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  有效期至 {new Date(invitation.expiresAt).toLocaleString("zh-CN")}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">提醒开关</CardTitle>
          <CardDescription>先做应用内提醒，后续可扩展推送通知。</CardDescription>
        </div>
        <div className="space-y-3">
          <SettingSwitch
            checked={profile?.notificationPreferences.anniversaryReminder ?? true}
            description="纪念日即将到来"
            title="纪念日提醒"
            onChange={(checked) =>
              updateProfile({
                notificationPreferences: {
                  ...profile!.notificationPreferences,
                  anniversaryReminder: checked
                }
              })
            }
          />
          <SettingSwitch
            checked={profile?.notificationPreferences.birthdayReminder ?? true}
            description="生日即将到来"
            title="生日提醒"
            onChange={(checked) =>
              updateProfile({
                notificationPreferences: {
                  ...profile!.notificationPreferences,
                  birthdayReminder: checked
                }
              })
            }
          />
          <SettingSwitch
            checked={profile?.notificationPreferences.wishlistReminder ?? true}
            description="愿望目标日临近"
            title="愿望提醒"
            onChange={(checked) =>
              updateProfile({
                notificationPreferences: {
                  ...profile!.notificationPreferences,
                  wishlistReminder: checked
                }
              })
            }
          />
          <SettingSwitch
            checked={profile?.notificationPreferences.inactiveReminder ?? true}
            description="长时间没有新增回忆"
            title="久未记录提醒"
            onChange={(checked) =>
              updateProfile({
                notificationPreferences: {
                  ...profile!.notificationPreferences,
                  inactiveReminder: checked
                }
              })
            }
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">数据与隐私</CardTitle>
          <CardDescription>
            默认私密空间，未绑定空间的用户无法读取你们的数据。导出功能便于长期保存。
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            导出 JSON 数据
          </Button>
          <Button variant="outline" onClick={() => signOut()}>
            退出登录
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 border-destructive/20 bg-red-50/60">
        <div className="space-y-1">
          <CardTitle className="text-lg">危险操作区</CardTitle>
          <CardDescription>
            解除绑定前需要安全确认。共享数据会保留在原空间内，未删除空间数据。
          </CardDescription>
        </div>
        <Button
          variant="destructive"
          onClick={() => {
            const confirmation = window.prompt(
              `请输入当前空间名称「${spaceQuery.data?.name ?? ""}」以确认解除绑定`
            );
            if (confirmation === spaceQuery.data?.name) {
              leaveSpaceMutation.mutate();
            } else if (confirmation !== null) {
              toast.error("确认名称不匹配，已取消操作");
            }
          }}
        >
          解除绑定
        </Button>
      </Card>
    </div>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/35 p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
