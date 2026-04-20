# 小猪 APP 产品与架构说明

## 产品定位

小猪 APP 是一个给两个人长期共同使用的私密生活记录工具，不是社交 feed，也不是截图型浪漫概念稿。它围绕以下目标设计：

- 双人协作自然
- 云同步可靠
- 长期记录和检索友好
- 私密、安全、可配置
- 信息结构清晰，适合多年累积

## 核心对象

- 用户 `profiles`
- 情侣空间 `couple_spaces`
- 空间成员 `space_members`
- 邀请码 `invitations`
- 共同回忆 `memories`
- 照片附件 `memory_photos`
- 纪念日 `anniversaries`
- 留言/小纸条 `notes`
- 愿望清单 `wishlists`
- 活动记录 `activity_logs`

## 页面信息架构

- `/auth`
  - 密码登录
  - 魔法链接登录
  - 注册
- `/onboarding`
  - 创建情侣空间
  - 输入邀请码加入
- `/invite/[code]`
  - 预览邀请码
  - 接受邀请并加入空间
- `/dashboard`
  - 空间概览
  - 恋爱天数
  - 最近纪念日倒计时
  - 最近回忆
  - 随机留言
  - 愿望进度
  - 最近动态
  - 应用内提醒
- `/timeline`
  - 按月折叠的回忆时间线
  - 搜索和组合筛选
- `/search`
  - 全局检索和结果列表
- `/memories/new`
  - 新建回忆
- `/memories/[id]`
  - 回忆详情
- `/memories/[id]/edit`
  - 编辑回忆
- `/anniversaries`
  - 纪念日管理
- `/notes`
  - 留言/小纸条管理
- `/wishlist`
  - 愿望清单管理
- `/activity`
  - 最近动态
- `/settings`
  - 个人信息
  - 伴侣信息
  - 空间信息
  - 邀请码管理
  - 绑定状态
  - 提醒开关
  - 导出
  - 退出登录
  - 危险操作

## 权限与协作规则

- 一个账号只能加入一个情侣空间。
- 空间内数据默认双方可见。
- `visibility = private` 的记录只有创建者自己可见、可编辑。
- `visibility = space` 的记录双方都可见，且双方都可编辑。
- 删除操作统一需要二次确认。
- 同时编辑同一条记录时，采用最后保存为准。
- 详情页展示创建人、最后编辑人、更新时间。
- 邀请码默认 72 小时过期。
- 最近动态通过数据库触发器自动记录，不依赖前端补日志。

## 云同步与离线策略

- 正式模式：Supabase Auth + Postgres + Storage + Realtime
- 前端：TanStack Query 做缓存、失效管理和持久化
- 本地缓存：Query Cache 持久化到 `localStorage`
- 在线优先：以云端为准，刷新后自动拉取云端数据
- 图片上传：显示上传进度
- 实时同步：订阅空间内主要表的 Postgres changes，自动触发 query 失效
- 离线体验：支持离线浏览最近缓存；离线写入失败时即时提示并允许重试

## 设计风格

- 温柔、克制、自然
- 低饱和配色
- 移动端优先
- 强信息层级
- 不做海报式浪漫首页

## 工程策略

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn 风格基础组件
- Supabase 正式接入
- demo fallback，便于在未配置 Supabase 时先本地查看完整产品原型
