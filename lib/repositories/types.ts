import type {
  ActivityLog,
  Anniversary,
  AppUser,
  AuthCredentials,
  CoupleSpace,
  Invitation,
  Memory,
  MemoryComment,
  MemoryPhoto,
  NoteCard,
  SearchFilters,
  SignUpPayload,
  SpaceMember,
  UserProfile,
  WishlistItem
} from "@/lib/types";

export interface SaveMemoryInput
  extends Omit<
    Memory,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "updatedBy"
    | "createdByProfile"
    | "updatedByProfile"
  > {
  id?: string;
}

export interface SaveAnniversaryInput
  extends Omit<
    Anniversary,
    "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
  > {
  id?: string;
}

export interface SaveNoteInput
  extends Omit<NoteCard, "id" | "createdAt" | "updatedAt" | "createdBy" | "authorProfile"> {
  id?: string;
}

export interface SaveWishlistInput
  extends Omit<
    WishlistItem,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "updatedBy"
    | "createdByProfile"
    | "completedAt"
  > {
  id?: string;
  completedAt?: string | null;
}

export interface CreateMemoryCommentInput {
  memoryId: string;
  spaceId: string;
  content: string;
}

export interface CreateSpaceInput {
  name: string;
  startedOn?: string;
}

export interface UpdateSpaceInput {
  spaceId: string;
  name: string;
  startedOn?: string | null;
}

export interface UpdateProfileInput {
  fullName?: string;
  nickname?: string;
  avatarUrl?: string | null;
  partnerLabel?: string | null;
  bio?: string | null;
  notificationPreferences?: UserProfile["notificationPreferences"];
}

export interface UploadedPhoto extends MemoryPhoto {}

export interface InvitationPreview {
  invitation: Invitation;
  space?: CoupleSpace | null;
  inviter?: UserProfile | null;
}

export interface Repository {
  mode: "demo" | "supabase";
  auth: {
    getSessionUser: () => Promise<AppUser | null>;
    subscribe: (
      callback: (user: AppUser | null) => void
    ) => Promise<() => void> | (() => void);
    signInWithPassword: (credentials: AuthCredentials) => Promise<void>;
    signUpWithPassword: (payload: SignUpPayload) => Promise<void>;
    sendMagicLink: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
  };
  getProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (userId: string, input: UpdateProfileInput) => Promise<UserProfile>;
  getCurrentSpace: (spaceId: string) => Promise<CoupleSpace | null>;
  getSpaceMembers: (spaceId: string) => Promise<SpaceMember[]>;
  createSpace: (userId: string, input: CreateSpaceInput) => Promise<CoupleSpace>;
  updateSpace: (input: UpdateSpaceInput) => Promise<CoupleSpace>;
  createInvitation: (spaceId: string, createdBy: string) => Promise<Invitation>;
  getInvitations: (spaceId: string) => Promise<Invitation[]>;
  previewInvitation: (code: string) => Promise<InvitationPreview | null>;
  acceptInvitation: (userId: string, code: string) => Promise<CoupleSpace>;
  leaveSpace: (userId: string, spaceId: string) => Promise<void>;
  listMemories: (
    spaceId: string,
    userId: string,
    filters?: SearchFilters
  ) => Promise<Memory[]>;
  getMemory: (memoryId: string, userId: string) => Promise<Memory | null>;
  saveMemory: (userId: string, input: SaveMemoryInput) => Promise<Memory>;
  deleteMemory: (memoryId: string) => Promise<void>;
  listMemoryComments: (memoryId: string, userId: string) => Promise<MemoryComment[]>;
  addMemoryComment: (userId: string, input: CreateMemoryCommentInput) => Promise<MemoryComment>;
  deleteMemoryComment: (commentId: string) => Promise<void>;
  listAnniversaries: (spaceId: string, userId: string) => Promise<Anniversary[]>;
  saveAnniversary: (userId: string, input: SaveAnniversaryInput) => Promise<Anniversary>;
  deleteAnniversary: (anniversaryId: string) => Promise<void>;
  listNotes: (spaceId: string, userId: string) => Promise<NoteCard[]>;
  saveNote: (userId: string, input: SaveNoteInput) => Promise<NoteCard>;
  deleteNote: (noteId: string) => Promise<void>;
  listWishlist: (spaceId: string, userId: string) => Promise<WishlistItem[]>;
  saveWishlist: (userId: string, input: SaveWishlistInput) => Promise<WishlistItem>;
  completeWishlist: (userId: string, wishlistId: string) => Promise<WishlistItem>;
  deleteWishlist: (wishlistId: string) => Promise<void>;
  listActivities: (spaceId: string, limit?: number) => Promise<ActivityLog[]>;
  uploadMemoryPhotos: (
    userId: string,
    spaceId: string,
    files: File[],
    onProgress?: (fileName: string, progress: number) => void
  ) => Promise<UploadedPhoto[]>;
  exportSpaceData: (spaceId: string, userId: string) => Promise<Record<string, unknown>>;
}
