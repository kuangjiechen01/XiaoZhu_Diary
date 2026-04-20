import type {
  ActivityLog,
  Anniversary,
  CoupleSpace,
  Invitation,
  Memory,
  MemoryPhoto,
  NoteCard,
  SpaceMember,
  UserProfile,
  WishlistItem
} from "@/lib/types";

export function mapProfileRow(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email ?? row.user_email ?? "",
    fullName: row.full_name ?? "",
    nickname: row.nickname ?? "未命名",
    avatarUrl: row.avatar_url ?? null,
    partnerLabel: row.partner_label ?? null,
    bio: row.bio ?? null,
    primarySpaceId: row.primary_space_id ?? null,
    notificationPreferences: row.notification_preferences ?? {
      anniversaryReminder: true,
      wishlistReminder: true,
      birthdayReminder: true,
      inactiveReminder: true
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapSpaceRow(row: any): CoupleSpace {
  return {
    id: row.id,
    name: row.name,
    startedOn: row.started_on ?? null,
    coverPhotoUrl: row.cover_photo_url ?? null,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapMemberRow(row: any): SpaceMember {
  return {
    id: row.id,
    spaceId: row.space_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    profile: row.profile ? mapProfileRow(row.profile) : undefined
  };
}

export function mapInvitationRow(row: any): Invitation {
  return {
    id: row.id,
    spaceId: row.space_id,
    code: row.code,
    createdBy: row.created_by,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    acceptedBy: row.accepted_by ?? null,
    acceptedAt: row.accepted_at ?? null,
    spaceName: row.space_name,
    inviterName: row.inviter_name
  };
}

export function mapPhotoRow(row: any, url?: string): MemoryPhoto {
  return {
    id: row.id,
    memoryId: row.memory_id,
    path: row.storage_path,
    url: url ?? row.storage_path,
    width: row.width ?? null,
    height: row.height ?? null,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at
  };
}

export function mapMemoryRow(row: any, photoUrls?: Record<string, string>): Memory {
  const photos = Array.isArray(row.memory_photos)
    ? row.memory_photos.map((photo: any) =>
        mapPhotoRow(photo, photoUrls?.[photo.storage_path] ?? photo.storage_path)
      )
    : [];

  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    content: row.content,
    date: row.date,
    time: row.time ?? null,
    location: row.location ?? null,
    category: row.category,
    moodTags: row.mood_tags ?? [],
    photos,
    isStarred: row.is_starred ?? false,
    visibility: row.visibility,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByProfile: row.created_by_profile
      ? mapProfileRow(row.created_by_profile)
      : undefined,
    updatedByProfile: row.updated_by_profile
      ? mapProfileRow(row.updated_by_profile)
      : undefined
  };
}

export function mapAnniversaryRow(row: any): Anniversary {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    kind: row.kind,
    date: row.date,
    repeatRule: row.repeat_rule,
    sortOrder: row.sort_order,
    reminderEnabled: row.reminder_enabled,
    visibility: row.visibility,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapNoteRow(row: any): NoteCard {
  return {
    id: row.id,
    spaceId: row.space_id,
    content: row.content,
    visibility: row.visibility,
    isPinned: row.is_pinned,
    hideFromHomepage: row.hide_from_homepage,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorProfile: row.author_profile ? mapProfileRow(row.author_profile) : undefined
  };
}

export function mapWishlistRow(row: any): WishlistItem {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    note: row.note ?? null,
    category: row.category,
    targetDate: row.target_date ?? null,
    status: row.status,
    visibility: row.visibility,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByProfile: row.created_by_profile
      ? mapProfileRow(row.created_by_profile)
      : undefined
  };
}

export function mapActivityRow(row: any): ActivityLog {
  return {
    id: row.id,
    spaceId: row.space_id,
    actorId: row.actor_id,
    entityType: row.entity_type,
    entityId: row.entity_id ?? null,
    actionType: row.action_type,
    title: row.title,
    description: row.description ?? null,
    createdAt: row.created_at,
    actorProfile: row.actor_profile ? mapProfileRow(row.actor_profile) : undefined
  };
}
