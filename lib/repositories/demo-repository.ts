import { invitationExpiryHours } from "@/lib/constants";
import { withinDateRange } from "@/lib/date";
import { initialDemoDatabase, type DemoDatabase } from "@/lib/demo-data";
import type {
  ActivityLog,
  Anniversary,
  AppUser,
  CoupleSpace,
  Invitation,
  Memory,
  NoteCard,
  SpaceMember,
  UserProfile,
  WishlistItem
} from "@/lib/types";
import { generateId, generateInviteCode } from "@/lib/utils";

import type {
  CreateSpaceInput,
  InvitationPreview,
  Repository,
  SaveAnniversaryInput,
  SaveMemoryInput,
  SaveNoteInput,
  SaveWishlistInput,
  UpdateProfileInput,
  UpdateSpaceInput,
  UploadedPhoto
} from "./types";

const STORAGE_KEY = "shared-memory-space-demo-db";
const AUTH_EVENT = "shared-memory-auth-changed";
const DATA_EVENT = "shared-memory-data-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function emit(eventName: string) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(eventName));
}

function loadDatabase(): DemoDatabase {
  if (!isBrowser()) return initialDemoDatabase;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDemoDatabase));
    return structuredClone(initialDemoDatabase);
  }
  return JSON.parse(raw) as DemoDatabase;
}

function saveDatabase(next: DemoDatabase) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit(DATA_EVENT);
}

function withProfiles<T extends { createdBy?: string; updatedBy?: string; actorId?: string }>(
  db: DemoDatabase,
  item: T
) {
  const profileLookup = new Map(db.profiles.map((profile) => [profile.id, profile]));
  return {
    ...item,
    createdByProfile: item.createdBy ? profileLookup.get(item.createdBy) : undefined,
    updatedByProfile: item.updatedBy ? profileLookup.get(item.updatedBy) : undefined,
    actorProfile: item.actorId ? profileLookup.get(item.actorId) : undefined
  };
}

function getVisibleMemories(db: DemoDatabase, userId: string, spaceId: string) {
  return db.memories
    .filter(
      (memory) =>
        memory.spaceId === spaceId &&
        (memory.visibility === "space" || memory.createdBy === userId)
    )
    .map((memory) => withProfiles(db, memory))
    .sort((a, b) => `${b.date}${b.time ?? ""}`.localeCompare(`${a.date}${a.time ?? ""}`));
}

function getVisibleNotes(db: DemoDatabase, userId: string, spaceId: string) {
  return db.notes
    .filter(
      (note) =>
        note.spaceId === spaceId &&
        (note.visibility === "space" || note.createdBy === userId)
    )
    .map((note) => ({
      ...note,
      authorProfile: db.profiles.find((profile) => profile.id === note.createdBy)
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getVisibleAnniversaries(db: DemoDatabase, userId: string, spaceId: string) {
  return db.anniversaries
    .filter(
      (item) =>
        item.spaceId === spaceId &&
        (item.visibility === "space" || item.createdBy === userId)
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.date.localeCompare(b.date));
}

function getVisibleWishes(db: DemoDatabase, userId: string, spaceId: string) {
  return db.wishes
    .filter(
      (wish) =>
        wish.spaceId === spaceId &&
        (wish.visibility === "space" || wish.createdBy === userId)
    )
    .map((wish) => withProfiles(db, wish))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function appendActivity(
  db: DemoDatabase,
  activity: Omit<ActivityLog, "id" | "createdAt">
): DemoDatabase {
  const nextActivity: ActivityLog = {
    id: generateId("activity"),
    createdAt: new Date().toISOString(),
    ...activity
  };
  return { ...db, activities: [nextActivity, ...db.activities].slice(0, 120) };
}

function upsertProfile(
  db: DemoDatabase,
  userId: string,
  patch: Partial<UserProfile>
): DemoDatabase {
  return {
    ...db,
    profiles: db.profiles.map((profile) =>
      profile.id === userId
        ? {
            ...profile,
            ...patch,
            updatedAt: new Date().toISOString()
          }
        : profile
    )
  };
}

function ensureInvitationUsable(db: DemoDatabase, code: string) {
  const invitation = db.invitations.find((item) => item.code === code);
  if (!invitation) throw new Error("邀请码不存在");
  if (invitation.status !== "pending") throw new Error("邀请码已失效");
  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    throw new Error("邀请码已过期");
  }
  return invitation;
}

async function fileToDataUrl(file: File, onProgress?: (progress: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadstart = () => onProgress?.(15);
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.min(90, Math.round((event.loaded / event.total) * 90)));
    };
    reader.onload = () => {
      onProgress?.(100);
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function createDemoRepository(): Repository {
  return {
    mode: "demo",
    auth: {
      async getSessionUser() {
        const db = loadDatabase();
        const activeUser = db.users.find((user) => user.id === db.sessionUserId);
        if (!activeUser) return null;
        return { id: activeUser.id, email: activeUser.email } satisfies AppUser;
      },
      subscribe(callback) {
        if (!isBrowser()) return () => undefined;
        const handler = async () => {
          callback(await this.getSessionUser());
        };
        window.addEventListener(AUTH_EVENT, handler);
        return () => window.removeEventListener(AUTH_EVENT, handler);
      },
      async signInWithPassword({ email, password }) {
        const db = loadDatabase();
        const user = db.users.find(
          (candidate) => candidate.email === email && candidate.password === password
        );
        if (!user) throw new Error("邮箱或密码不正确");
        saveDatabase({ ...db, sessionUserId: user.id });
        emit(AUTH_EVENT);
      },
      async signUpWithPassword(payload) {
        const db = loadDatabase();
        if (db.users.some((user) => user.email === payload.email)) {
          throw new Error("该邮箱已被使用");
        }
        const userId = generateId("user");
        const nextDb: DemoDatabase = {
          ...db,
          sessionUserId: userId,
          users: [
            ...db.users,
            {
              id: userId,
              email: payload.email,
              password: payload.password
            }
          ],
          profiles: [
            ...db.profiles,
            {
              id: userId,
              email: payload.email,
              fullName: payload.fullName ?? payload.nickname,
              nickname: payload.nickname,
              avatarUrl: null,
              partnerLabel: null,
              bio: null,
              primarySpaceId: null,
              notificationPreferences: {
                anniversaryReminder: true,
                wishlistReminder: true,
                birthdayReminder: true,
                inactiveReminder: true
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        };
        saveDatabase(nextDb);
        emit(AUTH_EVENT);
      },
      async sendMagicLink(email) {
        const db = loadDatabase();
        const user = db.users.find((candidate) => candidate.email === email);
        if (!user) throw new Error("未找到该邮箱，请先注册");
        saveDatabase({ ...db, sessionUserId: user.id });
        emit(AUTH_EVENT);
      },
      async signOut() {
        const db = loadDatabase();
        saveDatabase({ ...db, sessionUserId: null });
        emit(AUTH_EVENT);
      }
    },
    async getProfile(userId) {
      const db = loadDatabase();
      return db.profiles.find((profile) => profile.id === userId) ?? null;
    },
    async updateProfile(userId, input) {
      const db = loadDatabase();
      const nextDb = upsertProfile(db, userId, input);
      saveDatabase(nextDb);
      const profile = nextDb.profiles.find((item) => item.id === userId);
      if (!profile) throw new Error("未找到用户资料");
      return profile;
    },
    async getCurrentSpace(spaceId) {
      const db = loadDatabase();
      return db.spaces.find((space) => space.id === spaceId) ?? null;
    },
    async getSpaceMembers(spaceId) {
      const db = loadDatabase();
      return db.members
        .filter((member) => member.spaceId === spaceId)
        .map((member) => ({
          ...member,
          profile: db.profiles.find((profile) => profile.id === member.userId)
        }));
    },
    async createSpace(userId, input: CreateSpaceInput) {
      let db = loadDatabase();
      const profile = db.profiles.find((item) => item.id === userId);
      if (!profile) throw new Error("未找到用户资料");
      if (profile.primarySpaceId) throw new Error("一个账号只能加入一个情侣空间");

      const space: CoupleSpace = {
        id: generateId("space"),
        name: input.name,
        startedOn: input.startedOn ?? null,
        coverPhotoUrl: null,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db = {
        ...db,
        spaces: [...db.spaces, space],
        members: [
          ...db.members,
          {
            id: generateId("member"),
            spaceId: space.id,
            userId,
            role: "owner",
            joinedAt: new Date().toISOString()
          }
        ]
      };
      db = upsertProfile(db, userId, { primarySpaceId: space.id });
      db = appendActivity(db, {
        spaceId: space.id,
        actorId: userId,
        entityType: "space",
        entityId: space.id,
        actionType: "created",
        title: "创建了情侣空间",
        description: input.name
      });
      saveDatabase(db);
      return space;
    },
    async updateSpace(input: UpdateSpaceInput) {
      const db = loadDatabase();
      const nextDb = {
        ...db,
        spaces: db.spaces.map((space) =>
          space.id === input.spaceId
            ? {
                ...space,
                name: input.name,
                startedOn: input.startedOn ?? null,
                updatedAt: new Date().toISOString()
              }
            : space
        )
      };
      saveDatabase(nextDb);
      const space = nextDb.spaces.find((item) => item.id === input.spaceId);
      if (!space) throw new Error("未找到情侣空间");
      return space;
    },
    async createInvitation(spaceId, createdBy) {
      const db = loadDatabase();
      const invitation: Invitation = {
        id: generateId("invite"),
        spaceId,
        code: generateInviteCode(),
        createdBy,
        status: "pending",
        expiresAt: new Date(
          Date.now() + invitationExpiryHours * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
        acceptedBy: null,
        acceptedAt: null
      };
      saveDatabase({
        ...db,
        invitations: [invitation, ...db.invitations]
      });
      return invitation;
    },
    async getInvitations(spaceId) {
      const db = loadDatabase();
      return db.invitations
        .filter((item) => item.spaceId === spaceId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async previewInvitation(code) {
      const db = loadDatabase();
      const invitation = db.invitations.find((item) => item.code === code);
      if (!invitation) return null;
      const space = db.spaces.find((item) => item.id === invitation.spaceId) ?? null;
      const inviter =
        db.profiles.find((profile) => profile.id === invitation.createdBy) ?? null;
      return {
        invitation: {
          ...invitation,
          spaceName: space?.name,
          inviterName: inviter?.nickname
        },
        space,
        inviter
      } satisfies InvitationPreview;
    },
    async acceptInvitation(userId, code) {
      let db = loadDatabase();
      const profile = db.profiles.find((item) => item.id === userId);
      if (!profile) throw new Error("未找到用户资料");
      if (profile.primarySpaceId) throw new Error("一个账号只能加入一个情侣空间");

      const invitation = ensureInvitationUsable(db, code);
      const memberCount = db.members.filter((item) => item.spaceId === invitation.spaceId).length;
      if (memberCount >= 2) throw new Error("该空间已经绑定满员");

      db = {
        ...db,
        members: [
          ...db.members,
          {
            id: generateId("member"),
            spaceId: invitation.spaceId,
            userId,
            role: "partner",
            joinedAt: new Date().toISOString()
          }
        ],
        invitations: db.invitations.map((item) =>
          item.id === invitation.id
            ? {
                ...item,
                status: "accepted",
                acceptedBy: userId,
                acceptedAt: new Date().toISOString()
              }
            : item
        )
      };
      db = upsertProfile(db, userId, { primarySpaceId: invitation.spaceId });
      db = appendActivity(db, {
        spaceId: invitation.spaceId,
        actorId: userId,
        entityType: "invite",
        entityId: invitation.id,
        actionType: "accepted",
        title: "加入了情侣空间",
        description: db.spaces.find((space) => space.id === invitation.spaceId)?.name
      });
      saveDatabase(db);

      const space = db.spaces.find((item) => item.id === invitation.spaceId);
      if (!space) throw new Error("未找到情侣空间");
      return space;
    },
    async leaveSpace(userId, spaceId) {
      let db = loadDatabase();
      db = {
        ...db,
        members: db.members.filter(
          (member) => !(member.userId === userId && member.spaceId === spaceId)
        )
      };
      db = upsertProfile(db, userId, { primarySpaceId: null });
      db = appendActivity(db, {
        spaceId,
        actorId: userId,
        entityType: "space",
        entityId: spaceId,
        actionType: "left",
        title: "解除绑定并离开了情侣空间"
      });
      saveDatabase(db);
    },
    async listMemories(spaceId, userId, filters) {
      const db = loadDatabase();
      return getVisibleMemories(db, userId, spaceId).filter((memory) => {
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
      const db = loadDatabase();
      const memory = db.memories.find((item) => item.id === memoryId);
      if (!memory) return null;
      if (memory.visibility === "private" && memory.createdBy !== userId) return null;
      return withProfiles(db, memory);
    },
    async saveMemory(userId, input: SaveMemoryInput) {
      let db = loadDatabase();
      const timestamp = new Date().toISOString();
      const existing = input.id ? db.memories.find((item) => item.id === input.id) : null;
      const memory: Memory = existing
        ? {
            ...existing,
            ...input,
            updatedBy: userId,
            updatedAt: timestamp
          }
        : {
            id: generateId("memory"),
            ...input,
            createdBy: userId,
            updatedBy: userId,
            createdAt: timestamp,
            updatedAt: timestamp
          };
      db = {
        ...db,
        memories: existing
          ? db.memories.map((item) => (item.id === memory.id ? memory : item))
          : [memory, ...db.memories]
      };
      db = appendActivity(db, {
        spaceId: memory.spaceId,
        actorId: userId,
        entityType: "memory",
        entityId: memory.id,
        actionType: existing ? "updated" : "created",
        title: existing ? "更新了一条回忆" : "新增了一条回忆",
        description: memory.title
      });
      saveDatabase(db);
      return withProfiles(db, memory);
    },
    async deleteMemory(memoryId) {
      let db = loadDatabase();
      const existing = db.memories.find((item) => item.id === memoryId);
      db = {
        ...db,
        memories: db.memories.filter((item) => item.id !== memoryId)
      };
      if (existing) {
        db = appendActivity(db, {
          spaceId: existing.spaceId,
          actorId: existing.updatedBy,
          entityType: "memory",
          entityId: existing.id,
          actionType: "deleted",
          title: "删除了一条回忆",
          description: existing.title
        });
      }
      saveDatabase(db);
    },
    async listAnniversaries(spaceId, userId) {
      const db = loadDatabase();
      return getVisibleAnniversaries(db, userId, spaceId);
    },
    async saveAnniversary(userId, input: SaveAnniversaryInput) {
      let db = loadDatabase();
      const timestamp = new Date().toISOString();
      const existing = input.id
        ? db.anniversaries.find((item) => item.id === input.id)
        : null;
      const anniversary: Anniversary = existing
        ? {
            ...existing,
            ...input,
            updatedBy: userId,
            updatedAt: timestamp
          }
        : {
            id: generateId("anniversary"),
            ...input,
            createdBy: userId,
            updatedBy: userId,
            createdAt: timestamp,
            updatedAt: timestamp
          };
      db = {
        ...db,
        anniversaries: existing
          ? db.anniversaries.map((item) =>
              item.id === anniversary.id ? anniversary : item
            )
          : [...db.anniversaries, anniversary]
      };
      saveDatabase(db);
      return anniversary;
    },
    async deleteAnniversary(anniversaryId) {
      const db = loadDatabase();
      saveDatabase({
        ...db,
        anniversaries: db.anniversaries.filter((item) => item.id !== anniversaryId)
      });
    },
    async listNotes(spaceId, userId) {
      const db = loadDatabase();
      return getVisibleNotes(db, userId, spaceId);
    },
    async saveNote(userId, input: SaveNoteInput) {
      let db = loadDatabase();
      const timestamp = new Date().toISOString();
      const existing = input.id ? db.notes.find((item) => item.id === input.id) : null;
      const note: NoteCard = existing
        ? {
            ...existing,
            ...input,
            updatedAt: timestamp
          }
        : {
            id: generateId("note"),
            ...input,
            createdBy: userId,
            createdAt: timestamp,
            updatedAt: timestamp
          };
      db = {
        ...db,
        notes: existing
          ? db.notes.map((item) => (item.id === note.id ? note : item))
          : [note, ...db.notes]
      };
      db = appendActivity(db, {
        spaceId: note.spaceId,
        actorId: userId,
        entityType: "note",
        entityId: note.id,
        actionType: existing ? "updated" : "created",
        title: existing ? "更新了一张小纸条" : "写了一张小纸条",
        description: note.content.slice(0, 36)
      });
      saveDatabase(db);
      return {
        ...note,
        authorProfile: db.profiles.find((profile) => profile.id === note.createdBy)
      };
    },
    async deleteNote(noteId) {
      const db = loadDatabase();
      saveDatabase({
        ...db,
        notes: db.notes.filter((item) => item.id !== noteId)
      });
    },
    async listWishlist(spaceId, userId) {
      const db = loadDatabase();
      return getVisibleWishes(db, userId, spaceId);
    },
    async saveWishlist(userId, input: SaveWishlistInput) {
      let db = loadDatabase();
      const timestamp = new Date().toISOString();
      const existing = input.id ? db.wishes.find((item) => item.id === input.id) : null;
      const wishlist: WishlistItem = existing
        ? {
            ...existing,
            ...input,
            updatedBy: userId,
            updatedAt: timestamp,
            completedAt:
              input.status === "completed" ? input.completedAt ?? timestamp : null
          }
        : {
            id: generateId("wish"),
            ...input,
            createdBy: userId,
            updatedBy: userId,
            completedAt:
              input.status === "completed" ? input.completedAt ?? timestamp : null,
            createdAt: timestamp,
            updatedAt: timestamp
          };
      db = {
        ...db,
        wishes: existing
          ? db.wishes.map((item) => (item.id === wishlist.id ? wishlist : item))
          : [wishlist, ...db.wishes]
      };
      db = appendActivity(db, {
        spaceId: wishlist.spaceId,
        actorId: userId,
        entityType: "wishlist",
        entityId: wishlist.id,
        actionType:
          wishlist.status === "completed" && existing?.status !== "completed"
            ? "completed"
            : existing
              ? "updated"
              : "created",
        title:
          wishlist.status === "completed" && existing?.status !== "completed"
            ? "完成了一条愿望清单"
            : existing
              ? "更新了一条愿望清单"
              : "新增了一条愿望清单",
        description: wishlist.title
      });
      saveDatabase(db);
      return withProfiles(db, wishlist);
    },
    async completeWishlist(userId, wishlistId) {
      const db = loadDatabase();
      const current = db.wishes.find((item) => item.id === wishlistId);
      if (!current) throw new Error("未找到愿望");
      return this.saveWishlist(userId, {
        ...current,
        id: current.id,
        status: "completed",
        completedAt: new Date().toISOString()
      });
    },
    async deleteWishlist(wishlistId) {
      const db = loadDatabase();
      saveDatabase({
        ...db,
        wishes: db.wishes.filter((item) => item.id !== wishlistId)
      });
    },
    async listActivities(spaceId, limit = 20) {
      const db = loadDatabase();
      return db.activities
        .filter((activity) => activity.spaceId === spaceId)
        .map((activity) => withProfiles(db, activity))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },
    async uploadMemoryPhotos(userId, spaceId, files, onProgress) {
      const uploaded = await Promise.all(
        files.map(async (file, index) => {
          const dataUrl = await fileToDataUrl(file, (progress) =>
            onProgress?.(file.name, progress)
          );
          return {
            id: generateId("photo"),
            path: `demo/${spaceId}/${userId}/${file.name}`,
            url: dataUrl,
            width: null,
            height: null,
            sortOrder: index,
            createdAt: new Date().toISOString()
          } satisfies UploadedPhoto;
        })
      );
      return uploaded;
    },
    async exportSpaceData(spaceId, userId) {
      const db = loadDatabase();
      const visibleMemories = await this.listMemories(spaceId, userId);
      return {
        space: db.spaces.find((space) => space.id === spaceId),
        members: await this.getSpaceMembers(spaceId),
        memories: visibleMemories,
        anniversaries: await this.listAnniversaries(spaceId, userId),
        notes: await this.listNotes(spaceId, userId),
        wishes: await this.listWishlist(spaceId, userId),
        activities: await this.listActivities(spaceId, 50)
      };
    }
  };
}

export { DATA_EVENT };
