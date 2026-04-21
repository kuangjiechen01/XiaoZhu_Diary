import type {
  ActivityLog,
  Anniversary,
  CoupleSpace,
  Invitation,
  Memory,
  MemoryComment,
  NoteCard,
  SpaceMember,
  UserProfile,
  WishlistItem
} from "@/lib/types";

const now = new Date().toISOString();

export interface DemoUserRecord {
  id: string;
  email: string;
  password: string;
}

export interface DemoDatabase {
  users: DemoUserRecord[];
  sessionUserId: string | null;
  profiles: UserProfile[];
  spaces: CoupleSpace[];
  members: SpaceMember[];
  invitations: Invitation[];
  memories: Memory[];
  memoryComments: MemoryComment[];
  anniversaries: Anniversary[];
  notes: NoteCard[];
  wishes: WishlistItem[];
  activities: ActivityLog[];
}

export const initialDemoDatabase: DemoDatabase = {
  users: [
    {
      id: "user_me",
      email: "me@example.com",
      password: "123456"
    },
    {
      id: "user_xiaozhu",
      email: "xiaozhu@example.com",
      password: "123456"
    }
  ],
  sessionUserId: "user_me",
  profiles: [
    {
      id: "user_me",
      email: "me@example.com",
      fullName: "你的名字",
      nickname: "我",
      avatarUrl: null,
      partnerLabel: "小猪",
      bio: "一起把日子认真记下来。",
      primarySpaceId: "space_home",
      notificationPreferences: {
        anniversaryReminder: true,
        wishlistReminder: true,
        birthdayReminder: true,
        inactiveReminder: true
      },
      createdAt: now,
      updatedAt: now
    },
    {
      id: "user_xiaozhu",
      email: "xiaozhu@example.com",
      fullName: "黄晨奕",
      nickname: "小猪",
      avatarUrl: null,
      partnerLabel: "你",
      bio: "把重要的小事都留下来。",
      primarySpaceId: "space_home",
      notificationPreferences: {
        anniversaryReminder: true,
        wishlistReminder: true,
        birthdayReminder: true,
        inactiveReminder: true
      },
      createdAt: now,
      updatedAt: now
    }
  ],
  spaces: [
    {
      id: "space_home",
      name: "我们的小宇宙",
      startedOn: "2023-09-16",
      coverPhotoUrl: null,
      createdBy: "user_me",
      createdAt: now,
      updatedAt: now
    }
  ],
  members: [
    {
      id: "member_1",
      spaceId: "space_home",
      userId: "user_me",
      role: "owner",
      joinedAt: now
    },
    {
      id: "member_2",
      spaceId: "space_home",
      userId: "user_xiaozhu",
      role: "partner",
      joinedAt: now
    }
  ],
  invitations: [],
  memories: [
    {
      id: "memory_1",
      spaceId: "space_home",
      title: "第一次去海边看日落",
      content:
        "风很大，我们站在防波堤上聊天，最后一起走到天黑。那天没有安排什么大事，但就是很想记下来。",
      date: "2024-05-02",
      time: "18:20",
      location: "舟山朱家尖",
      category: "旅行",
      moodTags: ["开心", "感动", "珍贵"],
      photos: [],
      isStarred: true,
      visibility: "space",
      createdBy: "user_me",
      updatedBy: "user_xiaozhu",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "memory_2",
      spaceId: "space_home",
      title: "下雨天一起做晚饭",
      content:
        "买了很多乱七八糟的食材，最后做出来的味道意外地还不错。你说以后想经常在家一起做饭。",
      date: "2024-11-11",
      time: "19:00",
      location: "家里",
      category: "日常碎片",
      moodTags: ["治愈", "轻松", "踏实"],
      photos: [],
      isStarred: false,
      visibility: "space",
      createdBy: "user_xiaozhu",
      updatedBy: "user_xiaozhu",
      createdAt: now,
      updatedAt: now
    }
  ],
  memoryComments: [
    {
      id: "comment_1",
      memoryId: "memory_1",
      spaceId: "space_home",
      content: "那天风真的很大，但和你站在一起就觉得很安心。",
      createdBy: "user_xiaozhu",
      createdAt: now
    },
    {
      id: "comment_2",
      memoryId: "memory_1",
      spaceId: "space_home",
      content: "下次还想再去一次，换个季节看看海边。",
      createdBy: "user_me",
      createdAt: now
    }
  ],
  anniversaries: [
    {
      id: "anniversary_1",
      spaceId: "space_home",
      title: "恋爱开始日",
      kind: "relationship_start",
      date: "2023-09-16",
      repeatRule: "yearly",
      sortOrder: 1,
      reminderEnabled: true,
      visibility: "space",
      createdBy: "user_me",
      updatedBy: "user_me",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "anniversary_2",
      spaceId: "space_home",
      title: "小猪生日",
      kind: "birthday",
      date: "2000-08-08",
      repeatRule: "yearly",
      sortOrder: 2,
      reminderEnabled: true,
      visibility: "space",
      createdBy: "user_me",
      updatedBy: "user_me",
      createdAt: now,
      updatedAt: now
    }
  ],
  notes: [
    {
      id: "note_1",
      spaceId: "space_home",
      content: "今天也想和你一起好好过日子。",
      visibility: "space",
      isPinned: true,
      hideFromHomepage: false,
      createdBy: "user_xiaozhu",
      createdAt: now,
      updatedAt: now
    },
    {
      id: "note_2",
      spaceId: "space_home",
      content: "记得把下次旅行想去的地方加到愿望清单里。",
      visibility: "space",
      isPinned: false,
      hideFromHomepage: false,
      createdBy: "user_me",
      createdAt: now,
      updatedAt: now
    }
  ],
  wishes: [
    {
      id: "wish_1",
      spaceId: "space_home",
      title: "一起看一次冬天的雪",
      note: "最好是住两晚的小民宿。",
      category: "旅行",
      targetDate: "2026-01-10",
      status: "pending",
      visibility: "space",
      createdBy: "user_me",
      updatedBy: "user_me",
      completedAt: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "wish_2",
      spaceId: "space_home",
      title: "一起做一本照片小册子",
      note: "把过去一年最喜欢的 24 张照片挑出来。",
      category: "生活",
      targetDate: null,
      status: "completed",
      visibility: "space",
      createdBy: "user_xiaozhu",
      updatedBy: "user_xiaozhu",
      completedAt: now,
      createdAt: now,
      updatedAt: now
    }
  ],
  activities: [
    {
      id: "activity_1",
      spaceId: "space_home",
      actorId: "user_xiaozhu",
      entityType: "memory",
      entityId: "memory_2",
      actionType: "created",
      title: "小猪新增了一条回忆",
      description: "下雨天一起做晚饭",
      createdAt: now
    },
    {
      id: "activity_2",
      spaceId: "space_home",
      actorId: "user_me",
      entityType: "wishlist",
      entityId: "wish_1",
      actionType: "created",
      title: "你添加了一个愿望",
      description: "一起看一次冬天的雪",
      createdAt: now
    }
  ]
};
