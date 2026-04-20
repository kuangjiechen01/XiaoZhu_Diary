"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authSchema, signUpSchema } from "@/lib/validation/schemas";

type AuthFormValues = z.infer<typeof authSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const tabs = [
  { value: "password", label: "密码登录" },
  { value: "magic", label: "邮箱魔法链接" },
  { value: "signup", label: "注册" }
] as const;

export function AuthPanel() {
  const repository = useRepository();
  const { sendMagicLink, signInWithPassword, signUpWithPassword } = useAuth();
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["value"]>("password");
  const [submitting, setSubmitting] = useState(false);

  const loginForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: repository.mode === "demo" ? "me@example.com" : "",
      password: repository.mode === "demo" ? "123456" : ""
    }
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      nickname: "",
      fullName: ""
    }
  });

  const handlePasswordLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await signInWithPassword(values.email, values.password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  });

  const handleMagicLink = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await sendMagicLink(values.email);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "发送失败");
    } finally {
      setSubmitting(false);
    }
  });

  const handleSignUp = signUpForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await signUpWithPassword({
        email: values.email,
        password: values.password,
        nickname: values.nickname,
        fullName: values.fullName || values.nickname
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "注册失败");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Card className="space-y-5 p-6">
      <div className="space-y-2">
        <CardTitle>开始进入你们的共同空间</CardTitle>
        <CardDescription>
          支持邮箱密码和魔法链接登录。进入后可创建情侣空间，或用邀请码加入同一个空间。
        </CardDescription>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-2xl px-3 py-2 text-sm transition ${
              activeTab === tab.value ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "signup" ? (
        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <Label htmlFor="signup-nickname">昵称</Label>
            <Input id="signup-nickname" {...signUpForm.register("nickname")} />
            <p className="text-xs text-destructive">
              {signUpForm.formState.errors.nickname?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-fullName">姓名（可选）</Label>
            <Input id="signup-fullName" {...signUpForm.register("fullName")} />
            <p className="text-xs text-destructive">
              {signUpForm.formState.errors.fullName?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">邮箱</Label>
            <Input id="signup-email" type="email" {...signUpForm.register("email")} />
            <p className="text-xs text-destructive">
              {signUpForm.formState.errors.email?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">密码</Label>
            <Input
              id="signup-password"
              type="password"
              {...signUpForm.register("password")}
            />
            <p className="text-xs text-destructive">
              {signUpForm.formState.errors.password?.message}
            </p>
          </div>
          <Button className="w-full" disabled={submitting} type="submit">
            创建账户
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={activeTab === "password" ? handlePasswordLogin : handleMagicLink}
        >
          <div className="space-y-2">
            <Label htmlFor="auth-email">邮箱</Label>
            <Input id="auth-email" type="email" {...loginForm.register("email")} />
            <p className="text-xs text-destructive">
              {loginForm.formState.errors.email?.message}
            </p>
          </div>
          {activeTab === "password" ? (
            <div className="space-y-2">
              <Label htmlFor="auth-password">密码</Label>
              <Input
                id="auth-password"
                type="password"
                {...loginForm.register("password")}
              />
              <p className="text-xs text-destructive">
                {loginForm.formState.errors.password?.message}
              </p>
            </div>
          ) : null}
          <Button className="w-full" disabled={submitting} type="submit">
            {activeTab === "password" ? "登录" : "发送登录链接"}
          </Button>
        </form>
      )}

      {repository.mode === "demo" ? (
        <div className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
          Demo 账号：
          <br />
          `me@example.com / 123456`
          <br />
          `xiaozhu@example.com / 123456`
        </div>
      ) : (
        <div className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
          如果启用了邮箱确认，首次注册后请先到邮箱完成验证，再回到这里登录。
        </div>
      )}
    </Card>
  );
}
