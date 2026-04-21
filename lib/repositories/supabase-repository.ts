import { memoryPhotoBucket } from "@/lib/constants";
import { withinDateRange } from "@/lib/date";
import {
  mapActivityRow,
  mapAnniversaryRow,
  mapInvitationRow,
  mapMemberRow,
  mapMemoryCommentRow,
  mapMemoryRow,
  mapNoteRow,
  mapProfileRow,
  mapSpaceRow,
  mapWishlistRow
} from "@/lib/mappers/supabase";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { uploadFilesToSupabase } from "@/lib/supabase/upload";
import type {
  ActivityLog,
  Anniversary,
  AppUser,
  CoupleSpace,
  Invitation,
  Memory,
  MemoryComment,
  NoteCard,
  SpaceMember,
  UserProfile,
  WishlistItem
} from "@/lib/types";
import { generateInviteCode } from "@/lib/utils";

import type {
  CreateSpaceInput,
  InvitationPreview,
  Repository,
  SaveAnniversaryInput,
  SaveMemoryInput,
  SaveNoteInput,
  SaveWishlistInput,
  UpdateProfileInput,
  UpdateSpaceInput
} from "./types";

function ensure<T>(data: T | null, error: unknown, fallbackMessage: string) {
  if (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: string }).message)
        : fallbackMessage;
    throw new Error(message);
  }
  if (data === null) throw new Error(fallbackMessage);
  return data;
}

export function createSupabaseRepository(url: string, anonKey: string): Repository {
  const supabase = createBrowserSupabaseClient(url, anonKey);

  async function resolvePhotoUrls(rows: any[]) {
    const paths = rows.flatMap((row) =>
      Array.isArray(row.memory_photos)
        ? row.memory_photos
            .map((photo: any) => photo.storage_path)
            .filter((path: string | null) => Boolean(path))
        : []
    );

    if (!paths.length) return {} as Record<string, string>;
    const { data, error } = await supabase.storage
      .from(memoryPhotoBucket)
      .createSignedUrls(paths, 60 * 60);
    if (error) return {};
    return Object.fromEntries(
      (data ?? []).map((item: any) => [item.path, item.signedUrl])
    );
  }

  async function getProfileById(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data ? mapProfileRow(ensure(data, error, "未找到个人资料")) : null;
  }

  async function getSpaceMembersById(spaceId: string) {
    const { data, error } = await supabase
      .from("space_members")
      .select("*, profile:profiles!space_members_user_id_fkey(*)")
      .eq("space_id", spaceId)
      .order("joined_at", { ascending: true });
    return ensure(data, error, "读取空间成员失败").map(mapMemberRow) as SpaceMember[];
  }

  async function listVisibleMemories(spaceId: string, userId: string) {
    const { data, error } = await supabase
      .from("memories")
      .select(
        "*, memory_photos(*), created_by_profile:profiles!memories_created_by_fkey(*), updated_by_profile:profiles!memories_updated_by_fkey(*)"
      )
      .eq("space_id", spaceId)
      .or(`visibility.eq.space,created_by.eq.${userId}`)
      .order("date", { ascending: false })
      .order("time", { ascending: false });
    const rows = ensure(data, error, "读取回忆失败");
    const photoUrls = await resolvePhotoUrls(rows);
    return rows.map((row: any) => mapMemoryRow(row, photoUrls)) as Memory[];
  }

  return {
    mode: "supabase",
    auth: {
      async getSessionUser() {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user?.email) return null;
        return {
          id: user.id,
          email: user.email
        } satisfies AppUser;
      },
      subscribe(callback) {
        const {
          data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
          const user = session?.user?.email
            ? ({
                id: session.user.id,
                email: session.user.email
              } satisfies AppUser)
            : null;
          callback(user);
        });
        return () => subscription.unsubscribe();
      },
      async signInWithPassword(credentials) {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw new Error(error.message);
      },
      async signUpWithPassword(payload) {
        const { error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              full_name: payload.fullName ?? payload.nickname,
              nickname: payload.nickname
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw new Error(error.message);
      },
      async sendMagicLink(email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw new Error(error.message);
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
      }
    },
    async getProfile(userId) {
      return getProfileById(userId);
    },
    async updateProfile(userId, input: UpdateProfileInput) {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: input.fullName,
          nickname: input.nickname,
          avatar_url: input.avatarUrl,
          partner_label: input.partnerLabel,
          bio: input.bio,
          notification_preferences: input.notificationPreferences
        })
        .eq("id", userId)
        .select("*")
        .single();
      return mapProfileRow(ensure(data, error, "保存个人资料失败"));
    },
    async getCurrentSpace(spaceId) {
      const { data, error } = await supabase
        .from("couple_spaces")
        .select("*")
        .eq("id", spaceId)
        .maybeSingle();
      return data ? mapSpaceRow(ensure(data, error, "读取空间失败")) : null;
    },
    async getSpaceMembers(spaceId) {
      return getSpaceMembersById(spaceId);
    },
    async createSpace(_userId, input: CreateSpaceInput) {
      const { data, error } = await supabase.rpc("create_couple_space", {
        p_name: input.name,
        p_started_on: input.startedOn ?? null
      });
      const spaceRow = Array.isArray(data) ? data[0] : data;
      return mapSpaceRow(ensure(spaceRow, error, "创建情侣空间失败"));
    },
    async updateSpace(input: UpdateSpaceInput) {
      const { data, error } = await supabase
        .from("couple_spaces")
        .update({
          name: input.name,
          started_on: input.startedOn ?? null
        })
        .eq("id", input.spaceId)
        .select("*")
        .single();
      return mapSpaceRow(ensure(data, error, "更新空间失败"));
    },
    async createInvitation(spaceId, createdBy) {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          space_id: spaceId,
          code: generateInviteCode(),
          created_by: createdBy
        })
        .select("*")
        .single();
      return mapInvitationRow(ensure(data, error, "创建邀请码失败"));
    },
    async getInvitations(spaceId) {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("space_id", spaceId)
        .order("created_at", { ascending: false });
      return ensure(data, error, "读取邀请码失败").map(mapInvitationRow) as Invitation[];
    },
    async previewInvitation(code) {
      const { data, error } = await supabase.rpc("preview_invitation", {
        p_code: code
      });
      if (error) throw new Error(error.message);
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return null;
      const invitation = mapInvitationRow(row);
      return {
        invitation,
        inviter: row.inviter_id
          ? ({
              id: row.inviter_id,
              email: "",
              fullName: row.inviter_full_name ?? "",
              nickname: row.inviter_name ?? "",
              avatarUrl: row.inviter_avatar_url ?? null,
              partnerLabel: null,
              bio: null,
              primarySpaceId: row.space_id,
              notificationPreferences: {
                anniversaryReminder: true,
                wishlistReminder: true,
                birthdayReminder: true,
                inactiveReminder: true
              },
              createdAt: row.created_at,
              updatedAt: row.created_at
            } satisfies UserProfile)
          : null,
        space: row.space_name
          ? ({
              id: row.space_id,
              name: row.space_name,
              startedOn: null,
              coverPhotoUrl: null,
              createdBy: row.created_by,
              createdAt: row.created_at,
              updatedAt: row.created_at
            } satisfies CoupleSpace)
          : null
      } satisfies InvitationPreview;
    },
    async acceptInvitation(_userId, code) {
      const { data, error } = await supabase.rpc("accept_invitation", {
        p_code: code
      });
      const spaceId = Array.isArray(data) ? data[0]?.space_id : data?.space_id ?? data;
      if (error) throw new Error(error.message);
      const space = await this.getCurrentSpace(spaceId);
      if (!space) throw new Error("邀请码已接受，但读取空间失败");
      return space;
    },
    async leaveSpace(_userId, spaceId) {
      const { error } = await supabase.rpc("leave_couple_space", {
        p_space_id: spaceId
      });
      if (error) throw new Error(error.message);
    },
    async listMemories(spaceId, userId, filters) {
      const memories = await listVisibleMemories(spaceId, userId);
      return memories.filter((memory) => {
        const matchesQuery =
          !filters?.q ||
          [memory.title, memory.content, memory.location, memory.moodTags.join(" ")]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(filters.q.toLowerCase());
        const matchesCategory =
          !filters?.category ||
          filters.category === "全部" ||
          memory.category === filters.category;
        const matchesAuthor =
          !filters?.authorId || memory.createdBy === filters.authorId;
        const matchesStar = !filters?.onlyStarred || memory.isStarred;
        const matchesPhotos = !filters?.withPhotos || memory.photos.length > 0;
        return (
          matchesQuery &&
          matchesCategory &&
          matchesAuthor &&
          matchesStar &&
          matchesPhotos &&
          withinDateRange(memory.date, filters?.startDate, filters?.endDate)
        );
      });
    },
    async getMemory(memoryId, userId) {
      const { data, error } = await supabase
        .from("memories")
        .select(
          "*, memory_photos(*), created_by_profile:profiles!memories_created_by_fkey(*), updated_by_profile:profiles!memories_updated_by_fkey(*)"
        )
        .eq("id", memoryId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      if (data.visibility === "private" && data.created_by !== userId) return null;
      const photoUrls = await resolvePhotoUrls([data]);
      return mapMemoryRow(data, photoUrls);
    },
    async saveMemory(userId, input: SaveMemoryInput) {
      const payload = {
        space_id: input.spaceId,
        title: input.title,
        content: input.content,
        date: input.date,
        time: input.time ?? null,
        location: input.location ?? null,
        category: input.category,
        mood_tags: input.moodTags,
        is_starred: input.isStarred,
        visibility: input.visibility,
        updated_by: userId
      };

      let memoryId = input.id;
      if (input.id) {
        const { error } = await supabase
          .from("memories")
          .update(payload)
          .eq("id", input.id);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("memories")
          .insert({
            ...payload,
            created_by: userId
          })
          .select("id")
          .single();
        memoryId = ensure(data, error, "创建回忆失败").id;
      }

      const { error: deletePhotosError } = await supabase
        .from("memory_photos")
        .delete()
        .eq("memory_id", memoryId);
      if (deletePhotosError) throw new Error(deletePhotosError.message);

      if (input.photos.length) {
        const { error: insertPhotosError } = await supabase.from("memory_photos").insert(
          input.photos.map((photo, index) => ({
            memory_id: memoryId,
            storage_path: photo.path,
            width: photo.width ?? null,
            height: photo.height ?? null,
            sort_order: photo.sortOrder ?? index
          }))
        );
        if (insertPhotosError) throw new Error(insertPhotosError.message);
      }

      const nextMemory = await this.getMemory(memoryId!, userId);
      if (!nextMemory) throw new Error("保存后读取回忆失败");
      return nextMemory;
    },
    async deleteMemory(memoryId) {
      const { error } = await supabase.from("memories").delete().eq("id", memoryId);
      if (error) throw new Error(error.message);
    },
    async listMemoryComments(memoryId, userId) {
      const memory = await this.getMemory(memoryId, userId);
      if (!memory) return [];

      const { data, error } = await supabase
        .from("memory_comments")
        .select("*, author_profile:profiles!memory_comments_created_by_fkey(*)")
        .eq("memory_id", memoryId)
        .order("created_at", { ascending: true });
      return ensure(data, error, "读取评论失败").map(mapMemoryCommentRow) as MemoryComment[];
    },
    async addMemoryComment(userId, input) {
      const { data, error } = await supabase
        .from("memory_comments")
        .insert({
          memory_id: input.memoryId,
          space_id: input.spaceId,
          content: input.content.trim(),
          created_by: userId
        })
        .select("*, author_profile:profiles!memory_comments_created_by_fkey(*)")
        .single();
      return mapMemoryCommentRow(ensure(data, error, "发表评论失败"));
    },
    async deleteMemoryComment(commentId) {
      const { error } = await supabase
        .from("memory_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw new Error(error.message);
    },
    async listAnniversaries(spaceId, userId) {
      const { data, error } = await supabase
        .from("anniversaries")
        .select("*")
        .eq("space_id", spaceId)
        .or(`visibility.eq.space,created_by.eq.${userId}`)
        .order("sort_order", { ascending: true })
        .order("date", { ascending: true });
      return ensure(data, error, "读取纪念日失败").map(mapAnniversaryRow) as Anniversary[];
    },
    async saveAnniversary(userId, input: SaveAnniversaryInput) {
      const payload = {
        space_id: input.spaceId,
        title: input.title,
        kind: input.kind,
        date: input.date,
        repeat_rule: input.repeatRule,
        sort_order: input.sortOrder,
        reminder_enabled: input.reminderEnabled,
        visibility: input.visibility,
        updated_by: userId
      };
      const query = input.id
        ? supabase
            .from("anniversaries")
            .update(payload)
            .eq("id", input.id)
            .select("*")
            .single()
        : supabase
            .from("anniversaries")
            .insert({ ...payload, created_by: userId })
            .select("*")
            .single();
      const { data, error } = await query;
      return mapAnniversaryRow(ensure(data, error, "保存纪念日失败"));
    },
    async deleteAnniversary(anniversaryId) {
      const { error } = await supabase
        .from("anniversaries")
        .delete()
        .eq("id", anniversaryId);
      if (error) throw new Error(error.message);
    },
    async listNotes(spaceId, userId) {
      const { data, error } = await supabase
        .from("notes")
        .select("*, author_profile:profiles!notes_created_by_fkey(*)")
        .eq("space_id", spaceId)
        .or(`visibility.eq.space,created_by.eq.${userId}`)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      return ensure(data, error, "读取留言失败").map(mapNoteRow) as NoteCard[];
    },
    async saveNote(userId, input: SaveNoteInput) {
      const payload = {
        space_id: input.spaceId,
        content: input.content,
        visibility: input.visibility,
        is_pinned: input.isPinned,
        hide_from_homepage: input.hideFromHomepage
      };
      const query = input.id
        ? supabase
            .from("notes")
            .update(payload)
            .eq("id", input.id)
            .select("*, author_profile:profiles!notes_created_by_fkey(*)")
            .single()
        : supabase
            .from("notes")
            .insert({ ...payload, created_by: userId })
            .select("*, author_profile:profiles!notes_created_by_fkey(*)")
            .single();
      const { data, error } = await query;
      return mapNoteRow(ensure(data, error, "保存小纸条失败"));
    },
    async deleteNote(noteId) {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw new Error(error.message);
    },
    async listWishlist(spaceId, userId) {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*, created_by_profile:profiles!wishlists_created_by_fkey(*)")
        .eq("space_id", spaceId)
        .or(`visibility.eq.space,created_by.eq.${userId}`)
        .order("updated_at", { ascending: false });
      return ensure(data, error, "读取愿望失败").map(mapWishlistRow) as WishlistItem[];
    },
    async saveWishlist(userId, input: SaveWishlistInput) {
      const payload = {
        space_id: input.spaceId,
        title: input.title,
        note: input.note ?? null,
        category: input.category,
        target_date: input.targetDate ?? null,
        status: input.status,
        visibility: input.visibility,
        updated_by: userId,
        completed_at: input.status === "completed" ? input.completedAt ?? new Date().toISOString() : null
      };
      const query = input.id
        ? supabase
            .from("wishlists")
            .update(payload)
            .eq("id", input.id)
            .select("*, created_by_profile:profiles!wishlists_created_by_fkey(*)")
            .single()
        : supabase
            .from("wishlists")
            .insert({ ...payload, created_by: userId })
            .select("*, created_by_profile:profiles!wishlists_created_by_fkey(*)")
            .single();
      const { data, error } = await query;
      return mapWishlistRow(ensure(data, error, "保存愿望失败"));
    },
    async completeWishlist(userId, wishlistId) {
      const { data, error } = await supabase
        .from("wishlists")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq("id", wishlistId)
        .select("*, created_by_profile:profiles!wishlists_created_by_fkey(*)")
        .single();
      return mapWishlistRow(ensure(data, error, "完成愿望失败"));
    },
    async deleteWishlist(wishlistId) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", wishlistId);
      if (error) throw new Error(error.message);
    },
    async listActivities(spaceId, limit = 20) {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, actor_profile:profiles!activity_logs_actor_id_fkey(*)")
        .eq("space_id", spaceId)
        .order("created_at", { ascending: false })
        .limit(limit);
      return ensure(data, error, "读取最近动态失败").map(mapActivityRow) as ActivityLog[];
    },
    async uploadMemoryPhotos(userId, spaceId, files, onProgress) {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("请先登录再上传图片");
      return uploadFilesToSupabase({
        supabaseUrl: url,
        anonKey,
        accessToken,
        userId,
        spaceId,
        files,
        onProgress
      });
    },
    async exportSpaceData(spaceId, userId) {
      const memories = await this.listMemories(spaceId, userId);
      return {
        space: await this.getCurrentSpace(spaceId),
        members: await this.getSpaceMembers(spaceId),
        memories,
        memoryComments: (
          await Promise.all(memories.map((memory) => this.listMemoryComments(memory.id, userId)))
        ).flat(),
        anniversaries: await this.listAnniversaries(spaceId, userId),
        notes: await this.listNotes(spaceId, userId),
        wishes: await this.listWishlist(spaceId, userId),
        activities: await this.listActivities(spaceId, 100)
      };
    }
  };
}
