-- Additive migration for the migrated TEST_ prototype; no production business records.
create function public.portal_valid_snapshot(doc jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  collection jsonb;
  item jsonb;
  module_key text;
begin
  if doc is null or jsonb_typeof(doc) <> 'object' or doc->>'schemaVersion' is distinct from '1'
    or jsonb_typeof(doc->'moduleRows') is distinct from 'object'
    or jsonb_typeof(doc->'state') is distinct from 'object'
    or octet_length(doc::text) > 4194304 then return false; end if;
  foreach module_key in array array['people','organizations','requests','admissions','budget','assets','correspondence'] loop
    collection := doc->'moduleRows'->module_key;
    if jsonb_typeof(collection) is distinct from 'array' then return false; end if;
    for item in select value from jsonb_array_elements(collection) loop
      if jsonb_typeof(item) <> 'object' or left(coalesce(item->>'id',''),5) <> 'TEST_' then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function public.portal_valid_snapshot(jsonb) from public, anon;
grant execute on function public.portal_valid_snapshot(jsonb) to authenticated;

create table public.portal_seed (
  id text primary key check (id = 'TEST_SEED_001'),
  snapshot jsonb not null check (public.portal_valid_snapshot(snapshot)),
  source_commit text not null,
  created_at timestamptz not null default now()
);
create table public.portal_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null check (public.portal_valid_snapshot(snapshot)),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.portal_seed enable row level security;
alter table public.portal_workspaces enable row level security;
revoke all on public.portal_seed, public.portal_workspaces from public, anon, authenticated;
grant select on public.portal_seed to authenticated;
grant select, insert, update on public.portal_workspaces to authenticated;
create policy portal_seed_authenticated_read on public.portal_seed for select to authenticated using (true);
create policy portal_workspace_owner_read on public.portal_workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy portal_workspace_owner_insert on public.portal_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy portal_workspace_owner_update on public.portal_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.portal_save_workspace(p_user_id uuid, p_snapshot jsonb, p_expected_revision bigint) returns bigint
language plpgsql security invoker set search_path = '' as $$
declare result bigint;
begin
  if (select auth.uid()) is null or p_user_id is distinct from (select auth.uid()) then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'invalid_revision' using errcode = '22023';
  end if;
  if not public.portal_valid_snapshot(p_snapshot) then
    raise exception 'invalid_test_snapshot' using errcode = '22023';
  end if;
  if p_expected_revision = 0 then
    insert into public.portal_workspaces(user_id, snapshot, revision)
      values (p_user_id, p_snapshot, 1)
      on conflict (user_id) do nothing returning revision into result;
  else
    update public.portal_workspaces set snapshot = p_snapshot, revision = revision + 1, updated_at = now()
      where user_id = p_user_id and revision = p_expected_revision returning revision into result;
  end if;
  if result is null then raise exception 'revision_conflict' using errcode = '40001'; end if;
  return result;
end;
$$;
revoke all on function public.portal_save_workspace(uuid,jsonb,bigint) from public, anon;
grant execute on function public.portal_save_workspace(uuid,jsonb,bigint) to authenticated;
comment on table public.portal_workspaces is 'Private per-account JSONB snapshot of TEST workflows. Not the production nine-system relational schema.';
comment on table public.portal_seed is 'Full synthetic fixtures from the source portal. No real people, results, balances or uploaded confidential documents.';

-- Platform event-trigger helper does not need to be callable through the Data API.
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
