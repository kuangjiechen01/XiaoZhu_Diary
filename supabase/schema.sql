create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.couple_spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  started_on date,
  cover_photo_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  nickname text not null default '未命名',
  avatar_url text,
  partner_label text,
  bio text,
  primary_space_id uuid references public.couple_spaces(id) on delete set null,
  notification_preferences jsonb not null default '{
    "anniversaryReminder": true,
    "wishlistReminder": true,
    "birthdayReminder": true,
    "inactiveReminder": true
  }'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.space_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'partner')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique (space_id, user_id),
  unique (user_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null default timezone('utc', now()) + interval '72 hours',
  created_at timestamptz not null default timezone('utc', now()),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  title text not null,
  content text not null,
  date date not null,
  time text,
  location text,
  category text not null,
  mood_tags text[] not null default '{}',
  is_starred boolean not null default false,
  visibility text not null default 'space' check (visibility in ('space', 'private')),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(location, '')
    )
  ) stored
);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text not null,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.anniversaries (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('relationship_start', 'birthday', 'first_meet', 'first_trip', 'custom')),
  date date not null,
  repeat_rule text not null default 'yearly' check (repeat_rule in ('yearly', 'once')),
  sort_order integer not null default 0,
  reminder_enabled boolean not null default true,
  visibility text not null default 'space' check (visibility in ('space', 'private')),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  content text not null,
  visibility text not null default 'space' check (visibility in ('space', 'private')),
  is_pinned boolean not null default false,
  hide_from_homepage boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  title text not null,
  note text,
  category text not null,
  target_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  visibility text not null default 'space' check (visibility in ('space', 'private')),
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.couple_spaces(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('memory', 'anniversary', 'note', 'wishlist', 'space', 'invite')),
  entity_id uuid,
  action_type text not null check (action_type in ('created', 'updated', 'deleted', 'completed', 'joined', 'left', 'accepted')),
  title text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_space_members_space on public.space_members(space_id);
create index if not exists idx_memories_space_date on public.memories(space_id, date desc, created_at desc);
create index if not exists idx_memories_search on public.memories using gin(search_vector);
create index if not exists idx_anniversaries_space on public.anniversaries(space_id, sort_order, date);
create index if not exists idx_notes_space on public.notes(space_id, created_at desc);
create index if not exists idx_wishlists_space on public.wishlists(space_id, updated_at desc);
create index if not exists idx_activity_logs_space on public.activity_logs(space_id, created_at desc);

create trigger set_couple_spaces_updated_at
before update on public.couple_spaces
for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_memories_updated_at
before update on public.memories
for each row execute function public.set_updated_at();

create trigger set_anniversaries_updated_at
before update on public.anniversaries
for each row execute function public.set_updated_at();

create trigger set_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create trigger set_wishlists_updated_at
before update on public.wishlists
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    nickname
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_space_member(target_space uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.space_members
    where space_id = target_space
      and user_id = auth.uid()
  );
$$;

create or replace function public.shared_profile_visible(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_profile = auth.uid()
    or exists (
      select 1
      from public.space_members mine
      join public.space_members theirs on mine.space_id = theirs.space_id
      where mine.user_id = auth.uid()
        and theirs.user_id = target_profile
    );
$$;

create or replace function public.create_couple_space(p_name text, p_started_on date default null)
returns setof public.couple_spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  new_space public.couple_spaces;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.space_members where user_id = auth.uid()) then
    raise exception 'One account can only join one space';
  end if;

  insert into public.couple_spaces (name, started_on, created_by)
  values (p_name, p_started_on, auth.uid())
  returning * into new_space;

  insert into public.space_members (space_id, user_id, role)
  values (new_space.id, auth.uid(), 'owner');

  update public.profiles
  set primary_space_id = new_space.id
  where id = auth.uid();

  insert into public.activity_logs (space_id, actor_id, entity_type, entity_id, action_type, title, description)
  values (new_space.id, auth.uid(), 'space', new_space.id, 'created', '创建了情侣空间', new_space.name);

  return query select * from public.couple_spaces where id = new_space.id;
end;
$$;

create or replace function public.preview_invitation(p_code text)
returns table (
  id uuid,
  space_id uuid,
  code text,
  created_by uuid,
  status text,
  expires_at timestamptz,
  created_at timestamptz,
  accepted_by uuid,
  accepted_at timestamptz,
  space_name text,
  inviter_id uuid,
  inviter_name text,
  inviter_full_name text,
  inviter_avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    i.space_id,
    i.code,
    i.created_by,
    i.status,
    i.expires_at,
    i.created_at,
    i.accepted_by,
    i.accepted_at,
    s.name as space_name,
    p.id as inviter_id,
    p.nickname as inviter_name,
    p.full_name as inviter_full_name,
    p.avatar_url as inviter_avatar_url
  from public.invitations i
  join public.couple_spaces s on s.id = i.space_id
  join public.profiles p on p.id = i.created_by
  where i.code = upper(trim(p_code))
    and i.status = 'pending'
    and i.expires_at > timezone('utc', now())
  limit 1;
$$;

create or replace function public.accept_invitation(p_code text)
returns table (space_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record public.invitations;
  member_count integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.space_members where user_id = auth.uid()) then
    raise exception 'One account can only join one space';
  end if;

  select *
  into invite_record
  from public.invitations
  where code = upper(trim(p_code))
    and status = 'pending'
    and expires_at > timezone('utc', now())
  limit 1;

  if invite_record.id is null then
    raise exception 'Invitation unavailable';
  end if;

  select count(*)
  into member_count
  from public.space_members
  where space_id = invite_record.space_id;

  if member_count >= 2 then
    raise exception 'Space already full';
  end if;

  insert into public.space_members (space_id, user_id, role)
  values (invite_record.space_id, auth.uid(), 'partner');

  update public.invitations
  set status = 'accepted',
      accepted_by = auth.uid(),
      accepted_at = timezone('utc', now())
  where id = invite_record.id;

  update public.profiles
  set primary_space_id = invite_record.space_id
  where id = auth.uid();

  insert into public.activity_logs (space_id, actor_id, entity_type, entity_id, action_type, title)
  values (invite_record.space_id, auth.uid(), 'invite', invite_record.id, 'accepted', '加入了情侣空间');

  return query select invite_record.space_id;
end;
$$;

create or replace function public.leave_couple_space(p_space_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.space_members
  where space_id = p_space_id
    and user_id = auth.uid();

  update public.profiles
  set primary_space_id = null
  where id = auth.uid()
    and primary_space_id = p_space_id;

  insert into public.activity_logs (space_id, actor_id, entity_type, entity_id, action_type, title)
  values (p_space_id, auth.uid(), 'space', p_space_id, 'left', '解除绑定并离开了情侣空间');
end;
$$;

create or replace function public.log_entity_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid;
  title_text text;
  description_text text;
  action_text text;
  entity_text text;
begin
  entity_text := case
    when tg_table_name = 'memories' then 'memory'
    when tg_table_name = 'anniversaries' then 'anniversary'
    when tg_table_name = 'notes' then 'note'
    when tg_table_name = 'wishlists' then 'wishlist'
    else null
  end;

  if entity_text is null then
    return coalesce(new, old);
  end if;

  if tg_table_name = 'memories' then
    title_text := case when tg_op = 'INSERT' then '新增了一条回忆'
      when tg_op = 'UPDATE' then '更新了一条回忆'
      else '删除了一条回忆' end;
    description_text := coalesce(new.title, old.title);
    actor := coalesce(new.updated_by, old.updated_by, old.created_by);
  elsif tg_table_name = 'anniversaries' then
    title_text := case when tg_op = 'INSERT' then '新增了一个纪念日'
      when tg_op = 'UPDATE' then '更新了一个纪念日'
      else '删除了一个纪念日' end;
    description_text := coalesce(new.title, old.title);
    actor := coalesce(new.updated_by, old.updated_by, old.created_by);
  elsif tg_table_name = 'notes' then
    title_text := case when tg_op = 'INSERT' then '写了一张小纸条'
      when tg_op = 'UPDATE' then '更新了一张小纸条'
      else '删除了一张小纸条' end;
    description_text := left(coalesce(new.content, old.content), 60);
    actor := coalesce(new.created_by, old.created_by);
  elsif tg_table_name = 'wishlists' then
    if tg_op = 'UPDATE' and old.status <> 'completed' and new.status = 'completed' then
      title_text := '完成了一条愿望清单';
      action_text := 'completed';
    else
      title_text := case when tg_op = 'INSERT' then '新增了一条愿望清单'
        when tg_op = 'UPDATE' then '更新了一条愿望清单'
        else '删除了一条愿望清单' end;
    end if;
    description_text := coalesce(new.title, old.title);
    actor := coalesce(new.updated_by, old.updated_by, old.created_by);
  end if;

  action_text := coalesce(
    action_text,
    case when tg_op = 'INSERT' then 'created'
      when tg_op = 'UPDATE' then 'updated'
      else 'deleted' end
  );

  insert into public.activity_logs (
    space_id,
    actor_id,
    entity_type,
    entity_id,
    action_type,
    title,
    description
  )
  values (
    coalesce(new.space_id, old.space_id),
    actor,
    entity_text,
    coalesce(new.id, old.id),
    action_text,
    title_text,
    description_text
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists memories_activity_trigger on public.memories;
create trigger memories_activity_trigger
after insert or update or delete on public.memories
for each row execute function public.log_entity_activity();

drop trigger if exists anniversaries_activity_trigger on public.anniversaries;
create trigger anniversaries_activity_trigger
after insert or update or delete on public.anniversaries
for each row execute function public.log_entity_activity();

drop trigger if exists notes_activity_trigger on public.notes;
create trigger notes_activity_trigger
after insert or update or delete on public.notes
for each row execute function public.log_entity_activity();

drop trigger if exists wishlists_activity_trigger on public.wishlists;
create trigger wishlists_activity_trigger
after insert or update or delete on public.wishlists
for each row execute function public.log_entity_activity();

alter table public.profiles enable row level security;
alter table public.couple_spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.invitations enable row level security;
alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;
alter table public.anniversaries enable row level security;
alter table public.notes enable row level security;
alter table public.wishlists enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles are visible to self or shared members"
on public.profiles for select
to authenticated
using (public.shared_profile_visible(id));

create policy "users update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "members can view their space"
on public.couple_spaces for select
to authenticated
using (public.is_space_member(id));

create policy "members can update their space"
on public.couple_spaces for update
to authenticated
using (public.is_space_member(id))
with check (public.is_space_member(id));

create policy "members can view other members in the same space"
on public.space_members for select
to authenticated
using (public.is_space_member(space_id));

create policy "members can view invitations in their space"
on public.invitations for select
to authenticated
using (public.is_space_member(space_id));

create policy "members can create invitations"
on public.invitations for insert
to authenticated
with check (public.is_space_member(space_id) and created_by = auth.uid());

create policy "members can view visible memories"
on public.memories for select
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
);

create policy "members can create memories"
on public.memories for insert
to authenticated
with check (
  public.is_space_member(space_id)
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

create policy "members can update memories"
on public.memories for update
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
)
with check (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
  and updated_by = auth.uid()
);

create policy "members can delete memories"
on public.memories for delete
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
);

create policy "members can view memory photos"
on public.memory_photos for select
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.is_space_member(m.space_id)
      and (m.visibility = 'space' or m.created_by = auth.uid())
  )
);

create policy "members can manage memory photos"
on public.memory_photos for all
to authenticated
using (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.is_space_member(m.space_id)
      and (m.visibility = 'space' or m.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.memories m
    where m.id = memory_id
      and public.is_space_member(m.space_id)
      and (m.visibility = 'space' or m.created_by = auth.uid())
  )
);

create policy "members can view anniversaries"
on public.anniversaries for select
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
);

create policy "members can manage anniversaries"
on public.anniversaries for all
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
)
with check (
  public.is_space_member(space_id)
  and (created_by = auth.uid() or updated_by = auth.uid())
);

create policy "members can view notes"
on public.notes for select
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
);

create policy "members can manage notes"
on public.notes for all
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
)
with check (
  public.is_space_member(space_id)
  and created_by = auth.uid()
);

create policy "members can view wishlists"
on public.wishlists for select
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
);

create policy "members can manage wishlists"
on public.wishlists for all
to authenticated
using (
  public.is_space_member(space_id)
  and (visibility = 'space' or created_by = auth.uid())
)
with check (
  public.is_space_member(space_id)
  and (created_by = auth.uid() or updated_by = auth.uid())
);

create policy "members can view activity logs"
on public.activity_logs for select
to authenticated
using (public.is_space_member(space_id));

create policy "members can insert activity logs"
on public.activity_logs for insert
to authenticated
with check (public.is_space_member(space_id) and actor_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', false)
on conflict (id) do nothing;

create policy "space members can view uploaded photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'memory-photos'
  and public.is_space_member((storage.foldername(name))[1]::uuid)
);

create policy "space members can upload photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memory-photos'
  and public.is_space_member((storage.foldername(name))[1]::uuid)
);

create policy "space members can update photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'memory-photos'
  and public.is_space_member((storage.foldername(name))[1]::uuid)
);

create policy "space members can delete photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'memory-photos'
  and public.is_space_member((storage.foldername(name))[1]::uuid)
);
