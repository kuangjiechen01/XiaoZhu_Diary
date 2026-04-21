"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useRepository } from "@/components/providers/repository-provider";
import { appConfig, isSupabaseConfigured } from "@/lib/config";
import { DATA_EVENT } from "@/lib/repositories/demo-repository";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function RealtimeListener({ spaceId }: { spaceId?: string | null }) {
  const repository = useRepository();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!spaceId) return;

    if (repository.mode === "demo") {
      const handler = () => queryClient.invalidateQueries();
      window.addEventListener(DATA_EVENT, handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener(DATA_EVENT, handler);
        window.removeEventListener("storage", handler);
      };
    }

    if (!isSupabaseConfigured) return;
    const client = createBrowserSupabaseClient(
      appConfig.supabaseUrl,
      appConfig.supabaseAnonKey
    );
    const channel = client
      .channel(`space-${spaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memory_comments",
          filter: `space_id=eq.${spaceId}`
        },
        () => queryClient.invalidateQueries()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memories",
          filter: `space_id=eq.${spaceId}`
        },
        () => queryClient.invalidateQueries()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "anniversaries",
          filter: `space_id=eq.${spaceId}`
        },
        () => queryClient.invalidateQueries()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `space_id=eq.${spaceId}`
        },
        () => queryClient.invalidateQueries()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wishlists",
          filter: `space_id=eq.${spaceId}`
        },
        () => queryClient.invalidateQueries()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_logs",
          filter: `space_id=eq.${spaceId}`
        },
        () => queryClient.invalidateQueries()
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [queryClient, repository.mode, spaceId]);

  return null;
}
