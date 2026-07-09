-- dumpdates — data model (Phase 1)
-- Run this once in Supabase → SQL Editor, then run question_bank_seed.sql.
-- Safe to re-run: every statement is guarded (if not exists / or replace / drop first).

create extension if not exists pgcrypto;

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  admin_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index if not exists members_group_id_idx on members(group_id);
create index if not exists members_user_id_idx on members(user_id);

-- Two cycles per group can be active at once (one publishing, one nominating) —
-- status lives on the row, never a single "current cycle" pointer on groups.
create table if not exists cycles (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  month date not null, -- always the 1st of the month, e.g. 2026-07-01
  status text not null default 'nominating'
    check (status in ('nominating', 'answering', 'published')),
  pool_locked_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (group_id, month)
);

create index if not exists cycles_group_id_idx on cycles(group_id);

-- Shared 45-question fallback bank (not group-specific). Seeded by question_bank_seed.sql.
create table if not exists question_bank (
  id serial primary key,
  text text not null unique
);

-- The finalized per-cycle question pool, populated when the pool locks
-- (from nominations, or 5 random bank questions if nobody nominated).
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references cycles(id) on delete cascade,
  text text not null,
  source text not null check (source in ('nominated', 'bank_fallback')),
  nominated_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists questions_cycle_id_idx on questions(cycle_id);

create table if not exists nominations (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references cycles(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  question_bank_id integer references question_bank(id),
  custom_text text,
  created_at timestamptz not null default now(),
  constraint nominations_one_source check (
    (question_bank_id is not null and custom_text is null) or
    (question_bank_id is null and custom_text is not null)
  )
);

create index if not exists nominations_cycle_id_idx on nominations(cycle_id);
create index if not exists nominations_member_id_idx on nominations(member_id);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  text text,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, member_id)
);

create index if not exists answers_question_id_idx on answers(question_id);
create index if not exists answers_member_id_idx on answers(member_id);

-- =========================================================
-- TRIGGERS
-- =========================================================

-- Cap nominations at 3 per member per cycle (product rule, enforced in the DB).
create or replace function enforce_max_nominations()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*) from nominations
    where cycle_id = new.cycle_id and member_id = new.member_id
  ) >= 3 then
    raise exception 'max 3 nominations per member per cycle';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_max_nominations on nominations;
create trigger trg_enforce_max_nominations
  before insert on nominations
  for each row execute function enforce_max_nominations();

-- Keep answers.updated_at honest for the autosave UI.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_answers_updated_at on answers;
create trigger trg_answers_updated_at
  before update on answers
  for each row execute function set_updated_at();

-- =========================================================
-- RLS HELPER FUNCTIONS
-- security definer so they can check membership without recursive RLS lookups.
-- =========================================================

create or replace function is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

create or replace function is_group_admin(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from groups
    where id = p_group_id and admin_id = auth.uid()
  );
$$;

create or replace function my_member_id(p_group_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from members
  where group_id = p_group_id and user_id = auth.uid();
$$;

-- =========================================================
-- RLS
-- =========================================================

alter table groups enable row level security;
alter table members enable row level security;
alter table cycles enable row level security;
alter table question_bank enable row level security;
alter table questions enable row level security;
alter table nominations enable row level security;
alter table answers enable row level security;

-- groups: only members of a group can see it; only the admin can change it.
-- (Joining by invite code is handled by a security-definer function, built in Phase 4 —
-- that function bypasses this SELECT restriction on purpose, so invite codes are never
-- exposed via a broad "browse all groups" query.)
drop policy if exists groups_select on groups;
create policy groups_select on groups for select
  using (is_group_member(id));

drop policy if exists groups_insert on groups;
create policy groups_insert on groups for insert
  with check (admin_id = auth.uid());

drop policy if exists groups_update on groups;
create policy groups_update on groups for update
  using (is_group_admin(id))
  with check (is_group_admin(id));

drop policy if exists groups_delete on groups;
create policy groups_delete on groups for delete
  using (is_group_admin(id));

-- members: visible to anyone in the same group; a member can edit/remove themself,
-- the admin can remove anyone.
drop policy if exists members_select on members;
create policy members_select on members for select
  using (is_group_member(group_id));

-- Only the group's own admin can self-insert here (the create-group flow: insert
-- the group row, then this one for the creator). Joining via invite code is a
-- different path — a security-definer function (Phase 4) that bypasses this
-- policy on purpose, so a stranger can never add themself just by guessing a
-- group's id.
drop policy if exists members_insert on members;
create policy members_insert on members for insert
  with check (user_id = auth.uid() and is_group_admin(group_id));

drop policy if exists members_update on members;
create policy members_update on members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists members_delete on members;
create policy members_delete on members for delete
  using (user_id = auth.uid() or is_group_admin(group_id));

-- cycles: read-only for members. Writes only happen via the publish/lock Edge
-- Function using the service_role key, which bypasses RLS entirely — no client
-- write policy is defined here on purpose.
drop policy if exists cycles_select on cycles;
create policy cycles_select on cycles for select
  using (is_group_member(group_id));

-- question_bank: shared reference data, readable by any signed-in member. Writes
-- happen only via the seed script (run as the table owner), not by app users.
drop policy if exists question_bank_select on question_bank;
create policy question_bank_select on question_bank for select
  to authenticated
  using (true);

-- questions: the finalized pool, visible to the whole group once it exists.
-- No client write policy — populated by system logic when the pool locks (Phase 5).
drop policy if exists questions_select on questions;
create policy questions_select on questions for select
  using (is_group_member((select group_id from cycles where id = questions.cycle_id)));

-- nominations: visible to the group; a member can add/remove only their own,
-- and only while that cycle is still in the nominating window.
drop policy if exists nominations_select on nominations;
create policy nominations_select on nominations for select
  using (is_group_member((select group_id from cycles where id = nominations.cycle_id)));

drop policy if exists nominations_insert on nominations;
create policy nominations_insert on nominations for insert
  with check (
    member_id = my_member_id((select group_id from cycles where id = nominations.cycle_id))
    and (select status from cycles where id = nominations.cycle_id) = 'nominating'
  );

drop policy if exists nominations_delete on nominations;
create policy nominations_delete on nominations for delete
  using (
    member_id = my_member_id((select group_id from cycles where id = nominations.cycle_id))
    and (select status from cycles where id = nominations.cycle_id) = 'nominating'
  );

-- answers: THE core privacy rule. Before publish, a member sees only their own
-- answer to each question. After publish, the whole group can read everyone's.
-- Writes are only allowed while the cycle is in the 'answering' phase — this is
-- what makes answers un-editable after the deadline/lock, even via direct API calls.
drop policy if exists answers_select on answers;
create policy answers_select on answers for select
  using (
    member_id = my_member_id((
      select cy.group_id from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ))
    or (
      select cy.status from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ) = 'published'
  );

drop policy if exists answers_insert on answers;
create policy answers_insert on answers for insert
  with check (
    member_id = my_member_id((
      select cy.group_id from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ))
    and (
      select cy.status from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ) = 'answering'
  );

drop policy if exists answers_update on answers;
create policy answers_update on answers for update
  using (
    member_id = my_member_id((
      select cy.group_id from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ))
    and (
      select cy.status from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ) = 'answering'
  )
  with check (
    member_id = my_member_id((
      select cy.group_id from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ))
    and (
      select cy.status from questions q
      join cycles cy on cy.id = q.cycle_id
      where q.id = answers.question_id
    ) = 'answering'
  );

-- =========================================================
-- RPC FUNCTIONS (Phase 4 — create/join a group)
-- Both are security definer: they intentionally bypass the RLS policies above
-- (groups_select restricts to existing members; members_insert restricts to
-- the group's own admin), because creating a group and joining one by invite
-- code are exactly the two moments where that restriction doesn't apply yet.
-- =========================================================

-- Creates the group and the creator's own membership row in one transaction,
-- retrying a fresh invite code on the rare unique-constraint collision.
-- Output columns are prefixed "out_" on purpose — RETURNS TABLE column names
-- become plpgsql variables inside the function body, and an unprefixed name
-- like "group_id" would collide with the real members.group_id column and
-- make any query that references it ambiguous.
drop function if exists create_group(text, text);
create function create_group(p_name text, p_username text)
returns table (out_group_id uuid, out_group_name text, out_invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_code text;
  v_chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_attempt int := 0;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;

    begin
      insert into groups (name, invite_code, admin_id)
      values (p_name, v_code, auth.uid())
      returning id into v_group_id;
      exit;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt >= 5 then
        raise exception 'could not generate a unique invite code, try again';
      end if;
    end;
  end loop;

  insert into members (group_id, user_id, username)
  values (v_group_id, auth.uid(), p_username);

  return query select v_group_id, p_name, v_code;
end;
$$;

revoke execute on function create_group(text, text) from public;
grant execute on function create_group(text, text) to authenticated;

-- Looks up the group by invite code and adds the caller as a member.
drop function if exists join_group(text, text);
create function join_group(p_invite_code text, p_username text)
returns table (out_group_id uuid, out_group_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_group_name text;
begin
  select id, name into v_group_id, v_group_name
  from groups
  where invite_code = p_invite_code;

  if v_group_id is null then
    raise exception 'invalid invite code';
  end if;

  if exists (
    select 1 from members
    where members.group_id = v_group_id and members.user_id = auth.uid()
  ) then
    raise exception 'you''re already in this group';
  end if;

  insert into members (group_id, user_id, username)
  values (v_group_id, auth.uid(), p_username);

  return query select v_group_id, v_group_name;
end;
$$;

revoke execute on function join_group(text, text) from public;
grant execute on function join_group(text, text) to authenticated;
