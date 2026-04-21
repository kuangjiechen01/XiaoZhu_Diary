"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/providers/auth-provider";
import { useRepository } from "@/components/providers/repository-provider";
import type { SearchFilters } from "@/lib/types";

export const queryKeys = {
  profile: (userId?: string) => ["profile", userId],
  space: (spaceId?: string) => ["space", spaceId],
  members: (spaceId?: string) => ["members", spaceId],
  invites: (spaceId?: string) => ["invites", spaceId],
  memories: (spaceId?: string, filters?: SearchFilters) => [
    "memories",
    spaceId,
    filters ?? {}
  ],
  memory: (memoryId?: string) => ["memory", memoryId],
  memoryComments: (memoryId?: string) => ["memory-comments", memoryId],
  anniversaries: (spaceId?: string) => ["anniversaries", spaceId],
  notes: (spaceId?: string) => ["notes", spaceId],
  wishes: (spaceId?: string) => ["wishes", spaceId],
  activities: (spaceId?: string, limit = 20) => ["activities", spaceId, limit]
};

export function useCurrentSpace() {
  const { profile } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.space(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId),
    queryFn: () => repository.getCurrentSpace(profile!.primarySpaceId!)
  });
}

export function useSpaceMembers() {
  const { profile } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.members(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId),
    queryFn: () => repository.getSpaceMembers(profile!.primarySpaceId!)
  });
}

export function useInvitations() {
  const { profile } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.invites(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId),
    queryFn: () => repository.getInvitations(profile!.primarySpaceId!)
  });
}

export function useMemories(filters?: SearchFilters) {
  const { profile, user } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.memories(profile?.primarySpaceId ?? undefined, filters),
    enabled: Boolean(profile?.primarySpaceId && user?.id),
    queryFn: () => repository.listMemories(profile!.primarySpaceId!, user!.id, filters)
  });
}

export function useMemory(memoryId?: string) {
  const { user } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.memory(memoryId),
    enabled: Boolean(memoryId && user?.id),
    queryFn: () => repository.getMemory(memoryId!, user!.id)
  });
}

export function useMemoryComments(memoryId?: string) {
  const { user } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.memoryComments(memoryId),
    enabled: Boolean(memoryId && user?.id),
    queryFn: () => repository.listMemoryComments(memoryId!, user!.id)
  });
}

export function useAnniversaries() {
  const { profile, user } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.anniversaries(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId && user?.id),
    queryFn: () => repository.listAnniversaries(profile!.primarySpaceId!, user!.id)
  });
}

export function useNotes() {
  const { profile, user } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.notes(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId && user?.id),
    queryFn: () => repository.listNotes(profile!.primarySpaceId!, user!.id)
  });
}

export function useWishlist() {
  const { profile, user } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.wishes(profile?.primarySpaceId ?? undefined),
    enabled: Boolean(profile?.primarySpaceId && user?.id),
    queryFn: () => repository.listWishlist(profile!.primarySpaceId!, user!.id)
  });
}

export function useActivities(limit = 20) {
  const { profile } = useAuth();
  const repository = useRepository();
  return useQuery({
    queryKey: queryKeys.activities(profile?.primarySpaceId ?? undefined, limit),
    enabled: Boolean(profile?.primarySpaceId),
    queryFn: () => repository.listActivities(profile!.primarySpaceId!, limit)
  });
}
