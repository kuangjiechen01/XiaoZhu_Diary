import { z } from "zod";

import { memoryCategories, moodTags } from "@/lib/types";

export const authSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位")
});

export const signUpSchema = authSchema.extend({
  nickname: z.string().min(1, "请输入昵称").max(20, "昵称最多 20 个字"),
  fullName: z.string().max(30, "姓名最多 30 个字").optional().or(z.literal(""))
});

export const createSpaceSchema = z.object({
  name: z.string().min(2, "空间名称至少 2 个字").max(32, "空间名称最多 32 个字"),
  startedOn: z.string().optional()
});

export const joinSpaceSchema = z.object({
  code: z.string().min(4, "请输入邀请码").max(12, "邀请码长度不正确")
});

export const memorySchema = z.object({
  title: z.string().min(1, "请输入标题").max(60, "标题最多 60 个字"),
  content: z.string().min(1, "请写下这段回忆").max(5000, "内容过长"),
  date: z.string().min(1, "请选择日期"),
  time: z.string().optional().or(z.literal("")),
  location: z.string().max(80, "地点最多 80 个字").optional().or(z.literal("")),
  category: z.enum(memoryCategories),
  moodTags: z.array(z.enum(moodTags)).max(5, "最多选择 5 个标签"),
  visibility: z.enum(["space", "private"]),
  isStarred: z.boolean(),
  photos: z.array(
    z.object({
      id: z.string(),
      path: z.string().optional().nullable(),
      url: z.string(),
      sortOrder: z.number(),
      width: z.number().nullable().optional(),
      height: z.number().nullable().optional()
    })
  )
});

export const anniversarySchema = z.object({
  title: z.string().min(1, "请输入名称").max(40, "名称最多 40 个字"),
  kind: z.enum([
    "relationship_start",
    "birthday",
    "first_meet",
    "first_trip",
    "custom"
  ]),
  date: z.string().min(1, "请选择日期"),
  repeatRule: z.enum(["yearly", "once"]),
  sortOrder: z.coerce.number().min(0).max(99),
  reminderEnabled: z.boolean(),
  visibility: z.enum(["space", "private"])
});

export const memoryCommentSchema = z.object({
  content: z.string().trim().min(1, "写一点当时的想法吧").max(500, "评论最多 500 个字")
});

export const noteSchema = z.object({
  content: z.string().min(1, "写一点想说的话吧").max(280, "最多 280 个字"),
  visibility: z.enum(["space", "private"]),
  isPinned: z.boolean(),
  hideFromHomepage: z.boolean()
});

export const wishlistSchema = z.object({
  title: z.string().min(1, "请输入愿望标题").max(60, "标题最多 60 个字"),
  note: z.string().max(500, "备注最多 500 个字").optional().or(z.literal("")),
  category: z.string().min(1, "请输入分类").max(32, "分类最多 32 个字"),
  targetDate: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "completed"]),
  visibility: z.enum(["space", "private"])
});

export const profileSchema = z.object({
  fullName: z.string().max(30, "最多 30 个字").optional().or(z.literal("")),
  nickname: z.string().min(1, "请输入昵称").max(20, "昵称最多 20 个字"),
  partnerLabel: z.string().max(20, "最多 20 个字").optional().or(z.literal("")),
  bio: z.string().max(140, "最多 140 个字").optional().or(z.literal(""))
});
