export const memoryCategories = [
  "出去玩",
  "吃饭",
  "旅行",
  "纪念日",
  "礼物",
  "日常碎片",
  "吵架与和好",
  "重要决定",
  "惊喜时刻",
  "其他"
] as const;

export const moodTags = [
  "开心",
  "踏实",
  "期待",
  "感动",
  "治愈",
  "轻松",
  "勇敢",
  "热闹",
  "平静",
  "珍贵"
] as const;

export type MemoryCategory = (typeof memoryCategories)[number];
export type MoodTag = (typeof moodTags)[number];
export type Visibility = "space" | "private";
export type WishlistStatus = "pending" | "completed";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export type AnniversaryKind =
  | "relationship_start"
  | "birthday"
  | "first_meet"
  | "first_trip"
  | "custom";
export type RepeatRule = "yearly" | "once";
export type ActivityEntity =
  | "memory"
  | "anniversary"
  | "note"
  | "wishlist"
  | "space"
  | "invite";
export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "completed"
  | "joined"
  | "left"
  | "accepted";

export interface AppUser {
  id: string;
  email: string;
}

export interface NotificationPreferences {
  anniversaryReminder: boolean;
  wishlistReminder: boolean;
  birthdayReminder: boolean;
  inactiveReminder: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  nickname: string;
  avatarUrl?: string | null;
  partnerLabel?: string | null;
  bio?: string | null;
  primarySpaceId?: string | null;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface CoupleSpace {
  id: string;
  name: string;
  startedOn?: string | null;
  coverPhotoUrl?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  role: "owner" | "partner";
  joinedAt: string;
  profile?: UserProfile;
}

export interface Invitation {
  id: string;
  spaceId: string;
  code: string;
  createdBy: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  spaceName?: string;
  inviterName?: string;
}

export interface MemoryPhoto {
  id: string;
  memoryId?: string;
  path?: string | null;
  url: string;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  createdAt?: string;
}

export interface Memory {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  date: string;
  time?: string | null;
  location?: string | null;
  category: MemoryCategory;
  moodTags: MoodTag[];
  photos: MemoryPhoto[];
  isStarred: boolean;
  visibility: Visibility;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  createdByProfile?: UserProfile;
  updatedByProfile?: UserProfile;
}

export interface MemoryComment {
  id: string;
  memoryId: string;
  spaceId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  authorProfile?: UserProfile;
}

export interface Anniversary {
  id: string;
  spaceId: string;
  title: string;
  kind: AnniversaryKind;
  date: string;
  repeatRule: RepeatRule;
  sortOrder: number;
  reminderEnabled: boolean;
  visibility: Visibility;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCard {
  id: string;
  spaceId: string;
  content: string;
  visibility: Visibility;
  isPinned: boolean;
  hideFromHomepage: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  authorProfile?: UserProfile;
}

export interface WishlistItem {
  id: string;
  spaceId: string;
  title: string;
  note?: string | null;
  category: string;
  targetDate?: string | null;
  status: WishlistStatus;
  visibility: Visibility;
  createdBy: string;
  updatedBy: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByProfile?: UserProfile;
}

export interface ActivityLog {
  id: string;
  spaceId: string;
  actorId: string;
  entityType: ActivityEntity;
  entityId?: string | null;
  actionType: ActivityAction;
  title: string;
  description?: string | null;
  createdAt: string;
  actorProfile?: UserProfile;
}

export interface ReminderItem {
  id: string;
  title: string;
  description: string;
  type: "anniversary" | "birthday" | "wishlist" | "inactive";
  dueAt?: string;
}

export interface SearchFilters {
  q?: string;
  category?: MemoryCategory | "全部";
  startDate?: string;
  endDate?: string;
  authorId?: string;
  onlyStarred?: boolean;
  withPhotos?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpPayload extends AuthCredentials {
  nickname: string;
  fullName?: string;
}
