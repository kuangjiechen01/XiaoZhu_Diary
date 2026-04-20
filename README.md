# 小猪 APP

一个适合长期使用、支持双人协作、支持云同步、数据可靠、体验简洁耐用的情侣共同回忆记录 App 原型。

## 技术方案

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn 风格基础组件
- TanStack Query
- Supabase Auth / Postgres / Storage / Realtime
- PWA 基础能力
- demo fallback，本地未配置 Supabase 时也能先跑通界面和交互

## 产品架构

### 核心模块

- 共同回忆记录
- 时间线
- 回忆详情
- 纪念日
- 留言 / 小纸条
- 共同愿望清单
- 最近动态
- 设置与绑定管理

### 页面架构

- `/auth` 登录 / 注册 / 魔法链接
- `/onboarding` 创建空间 / 加入空间
- `/invite/[code]` 邀请接受页
- `/dashboard` 首页仪表盘
- `/timeline` 时间线
- `/search` 全局搜索
- `/memories/new` 新建回忆
- `/memories/[id]` 回忆详情
- `/memories/[id]/edit` 编辑回忆
- `/anniversaries` 纪念日管理
- `/notes` 留言管理
- `/wishlist` 愿望清单
- `/activity` 最近动态
- `/settings` 设置页

### 权限与协作逻辑

- 一个账号只能加入一个情侣空间
- 邀请码加入同一空间
- `space` 可见的数据双方都能看
- `private` 可见的数据只有创建者能看
- `space` 可见数据默认双方可编辑
- 删除需要二次确认
- 同时编辑时最后保存为准
- 详情页展示创建人、最后编辑人、更新时间

## 项目目录结构

```text
app/
  auth/
  onboarding/
  invite/[code]/
  (protected)/
    dashboard/
    timeline/
    search/
    memories/
    anniversaries/
    notes/
    wishlist/
    activity/
    settings/
components/
  app-shell/
  dashboard/
  forms/
  memories/
  providers/
  ui/
lib/
  config.ts
  constants.ts
  dashboard.ts
  date.ts
  demo-data.ts
  hooks/
  mappers/
  repositories/
  supabase/
  validation/
supabase/
  schema.sql
  seed.sql
docs/
  product-architecture.md
public/
  sw.js
```

## 数据库 schema

数据库表包括：

- `profiles`
- `couple_spaces`
- `space_members`
- `invitations`
- `memories`
- `memory_photos`
- `anniversaries`
- `notes`
- `wishlists`
- `activity_logs`

完整 SQL 见 [supabase/schema.sql](/Users/kuangjiechen/Desktop/小猪APP/supabase/schema.sql)。

## Supabase 配置步骤

1. 在 Supabase 创建新项目。
2. 打开 SQL Editor，执行 [supabase/schema.sql](/Users/kuangjiechen/Desktop/小猪APP/supabase/schema.sql)。
3. 在 Authentication 中开启 Email/Password；如需魔法链接，开启 Email OTP。
4. 在 URL Configuration 中把本地回调地址加入允许列表：
   - `http://localhost:3000`
5. 确认 `memory-photos` bucket 已创建并应用 Storage policy。
6. 在本地复制 `.env.example` 为 `.env.local` 并填入项目地址和 anon key。
7. 如果需要示例数据，先创建两个测试用户，再执行 [supabase/seed.sql](/Users/kuangjiechen/Desktop/小猪APP/supabase/seed.sql)。

## 环境变量示例

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## 本地启动方式

```bash
npm install
npm run dev
```

然后打开 `http://localhost:3000`。

如果未配置 Supabase，项目会自动进入 demo fallback 模式，方便先查看整体产品原型。

## 云同步与离线说明

- 正式模式下使用 Supabase 做认证、数据库、图片存储和实时同步
- TanStack Query 缓存最近数据，并持久化到 `localStorage`
- Service Worker 缓存基础静态资源
- 在线优先，离线时允许浏览最近缓存
- 上传失败和同步失败都会给出提示
- 图片上传显示进度

## 后续扩展建议

- 推送通知
- 更细粒度的实时协同提示
- AI 自动生成月度回顾
- 照片智能归档与相册轴线
- 更完善的离线队列和冲突提示
- 导出成纪念册 PDF
