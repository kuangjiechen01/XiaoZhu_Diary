"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { toast } from "sonner";

import { useRepository } from "@/components/providers/repository-provider";
import type { UpdateProfileInput } from "@/lib/repositories/types";
import type { AppUser, SignUpPayload, UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (payload: SignUpPayload) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const repository = useRepository();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (activeUser: AppUser | null) => {
      if (!activeUser) {
        setProfile(null);
        return;
      }
      const nextProfile = await repository.getProfile(activeUser.id);
      setProfile(nextProfile);
    },
    [repository]
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoading(true);
      const sessionUser = await repository.auth.getSessionUser();
      if (!mounted) return;
      setUser(sessionUser);
      await loadProfile(sessionUser);
      if (mounted) setLoading(false);
    };

    bootstrap().catch((error) => {
      console.error(error);
      toast.error("初始化账户状态失败");
      setLoading(false);
    });

    const unsubscribePromise = repository.auth.subscribe(async (nextUser) => {
      setUser(nextUser);
      await loadProfile(nextUser);
      queryClient.invalidateQueries();
      router.refresh();
    });

    return () => {
      mounted = false;
      Promise.resolve(unsubscribePromise).then((unsubscribe) => unsubscribe?.());
    };
  }, [loadProfile, queryClient, repository, router]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user);
  }, [loadProfile, user]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      await repository.auth.signInWithPassword({ email, password });
      toast.success("已登录");
    },
    [repository]
  );

  const signUpWithPassword = useCallback(
    async (payload: SignUpPayload) => {
      await repository.auth.signUpWithPassword(payload);
      toast.success("账户已创建");
    },
    [repository]
  );

  const sendMagicLink = useCallback(
    async (email: string) => {
      await repository.auth.sendMagicLink(email);
      toast.success("登录链接已发送，请检查邮箱");
    },
    [repository]
  );

  const signOut = useCallback(async () => {
    await repository.auth.signOut();
    queryClient.clear();
    toast.success("已退出登录");
    router.push("/auth");
  }, [queryClient, repository, router]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!user) return;
      const nextProfile = await repository.updateProfile(user.id, input);
      setProfile(nextProfile);
      queryClient.invalidateQueries();
      toast.success("个人资料已保存");
    },
    [queryClient, repository, user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      refreshProfile,
      signInWithPassword,
      signUpWithPassword,
      sendMagicLink,
      signOut,
      updateProfile
    }),
    [
      loading,
      profile,
      refreshProfile,
      sendMagicLink,
      signInWithPassword,
      signOut,
      signUpWithPassword,
      updateProfile,
      user
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProvider is missing in the tree.");
  }
  return context;
}
