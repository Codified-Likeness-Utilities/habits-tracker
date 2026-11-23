-- Habits tracker : schéma initial.
-- Chaque ligne appartient à un utilisateur ; la RLS garantit qu'il ne voit que les siennes.

create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  emoji       text not null default '✨',
  moment      text not null default 'morning'
              check (moment in ('morning', 'afternoon', 'evening')),
  -- Jours ISO où l'habitude est prévue : 1 = lundi … 7 = dimanche.
  days        smallint[] not null default '{1,2,3,4,5,6,7}'
              check (days <@ '{1,2,3,4,5,6,7}'::smallint[] and cardinality(days) > 0),
  position    integer not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

create index habits_user_idx on public.habits (user_id) where archived_at is null;

create table public.checkins (
  habit_id   uuid not null references public.habits (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,
  created_at timestamptz not null default now(),
  primary key (habit_id, day)
);

create index checkins_user_day_idx on public.checkins (user_id, day);

alter table public.habits   enable row level security;
alter table public.checkins enable row level security;

create policy "habits: owner only" on public.habits
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "checkins: owner only" on public.checkins
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );
