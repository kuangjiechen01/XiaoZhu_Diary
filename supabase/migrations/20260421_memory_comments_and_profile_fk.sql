begin;

insert into public.profiles (
  id,
  email,
  full_name,
  nickname,
  created_at,
  updated_at
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  coalesce(u.raw_user_meta_data->>'nickname', split_part(coalesce(u.email, ''), '@', 1)),
  timezone('utc', now()),
  timezone('utc', now())
from auth.users u
on conflict (id) do nothing;

alter table public.space_members
  drop constraint if exists space_members_user_id_fkey,
  drop constraint if exists space_members_user_id_profiles_fkey,
  add constraint space_members_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.memories
  drop constraint if exists memories_created_by_fkey,
  drop constraint if exists memories_created_by_profiles_fkey,
  add constraint memories_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete cascade,
  drop constraint if exists memories_updated_by_fkey,
  drop constraint if exists memories_updated_by_profiles_fkey,
  add constraint memories_updated_by_fkey
  foreign key (updated_by) references public.profiles(id) on delete cascade;

alter table public.anniversaries
  drop constraint if exists anniversaries_created_by_fkey,
  drop constraint if exists anniversaries_created_by_profiles_fkey,
  add constraint anniversaries_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete cascade,
  drop constraint if exists anniversaries_updated_by_fkey,
  drop constraint if exists anniversaries_updated_by_profiles_fkey,
  add constraint anniversaries_updated_by_fkey
  foreign key (updated_by) references public.profiles(id) on delete cascade;

alter table public.notes
  drop constraint if exists notes_created_by_fkey,
  drop constraint if exists notes_created_by_profiles_fkey,
  add constraint notes_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete cascade;

alter table public.wishlists
  drop constraint if exists wishlists_created_by_fkey,
  drop constraint if exists wishlists_created_by_profiles_fkey,
  add constraint wishlists_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete cascade,
  drop constraint if exists wishlists_updated_by_fkey,
  drop constraint if exists wishlists_updated_by_profiles_fkey,
  add constraint wishlists_updated_by_fkey
  foreign key (updated_by) references public.profiles(id) on delete cascade;

alter table public.activity_logs
  drop constraint if exists activity_logs_actor_id_fkey,
  drop constraint if exists activity_logs_actor_id_profiles_fkey,
  add constraint activity_logs_actor_id_fkey
  foreign key (actor_id) references public.profiles(id) on delete cascade;

create table if not exists public.memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  content text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_memory_comments_memory on public.memory_comments(memory_id, created_at);
create index if not exists idx_memory_comments_space on public.memory_comments(space_id, created_at);

alter table public.memory_comments enable row level security;

drop policy if exists "members can view memory comments" on public.memory_comments;
create policy "members can view memory comments"
on public.memory_comments for select
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and m.space_id = memory_comments.space_id
      and public.is_space_member(m.space_id)
      and (m.visibility = 'space' or m.created_by = auth.uid())
  )
);

drop policy if exists "members can create memory comments" on public.memory_comments;
create policy "members can create memory comments"
on public.memory_comments for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.memories m
    where m.id = memory_id
      and m.space_id = memory_comments.space_id
      and public.is_space_member(m.space_id)
      and (m.visibility = 'space' or m.created_by = auth.uid())
  )
);

drop policy if exists "authors can delete their memory comments" on public.memory_comments;
create policy "authors can delete their memory comments"
on public.memory_comments for delete
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1 from public.memories m
    where m.id = memory_id
      and m.space_id = memory_comments.space_id
      and public.is_space_member(m.space_id)
      and (m.visibility = 'space' or m.created_by = auth.uid())
  )
);

commit;
