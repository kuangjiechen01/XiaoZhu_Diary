-- Seed guidance:
-- 1. 先在 Auth 中创建两个测试用户。
-- 2. 再根据邮箱把他们的 UUID 找出来，把下面的邮箱替换成你的测试账号。

with me as (
  select id from auth.users where email = 'me@example.com' limit 1
),
partner as (
  select id from auth.users where email = 'xiaozhu@example.com' limit 1
),
space_insert as (
  insert into public.couple_spaces (name, started_on, created_by)
  select '我们的小宇宙', '2023-09-16', me.id
  from me
  returning id
)
insert into public.space_members (space_id, user_id, role)
select id, (select id from me), 'owner' from space_insert
union all
select id, (select id from partner), 'partner' from space_insert
on conflict do nothing;

update public.profiles
set primary_space_id = (
  select id from public.couple_spaces where name = '我们的小宇宙' order by created_at desc limit 1
)
where email in ('me@example.com', 'xiaozhu@example.com');

insert into public.memories (
  space_id,
  title,
  content,
  date,
  time,
  location,
  category,
  mood_tags,
  is_starred,
  visibility,
  created_by,
  updated_by
)
select
  (select id from public.couple_spaces where name = '我们的小宇宙' order by created_at desc limit 1),
  '第一次去海边看日落',
  '风很大，我们站在防波堤上聊天，最后一起走到天黑。',
  '2024-05-02',
  '18:20',
  '舟山朱家尖',
  '旅行',
  array['开心', '感动', '珍贵'],
  true,
  'space',
  (select id from me),
  (select id from me)
where exists (select 1 from me);

insert into public.anniversaries (
  space_id,
  title,
  kind,
  date,
  repeat_rule,
  sort_order,
  reminder_enabled,
  visibility,
  created_by,
  updated_by
)
select
  (select id from public.couple_spaces where name = '我们的小宇宙' order by created_at desc limit 1),
  '恋爱开始日',
  'relationship_start',
  '2023-09-16',
  'yearly',
  1,
  true,
  'space',
  (select id from me),
  (select id from me)
where exists (select 1 from me);
