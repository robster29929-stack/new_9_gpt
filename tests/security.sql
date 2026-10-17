-- Transaction-only RLS and compare-and-swap checks. No users or rows survive.
begin;
select set_config('portal_test.user_a', gen_random_uuid()::text, true);
select set_config('portal_test.user_b', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('portal_test.user_a')::uuid), (current_setting('portal_test.user_b')::uuid);
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('portal_test.user_a'),'role','authenticated')::text, true);
do $$
declare doc jsonb; rev bigint;
begin
  select snapshot into strict doc from public.portal_seed where id='TEST_SEED_001';
  rev := public.portal_save_workspace(current_setting('portal_test.user_a')::uuid, doc, 0);
  if rev <> 1 then raise exception 'create failed'; end if;
  rev := public.portal_save_workspace(current_setting('portal_test.user_a')::uuid, doc, 1);
  if rev <> 2 then raise exception 'update failed'; end if;
  begin
    perform public.portal_save_workspace(current_setting('portal_test.user_a')::uuid, doc, 1);
    raise exception 'stale revision was accepted';
  exception when sqlstate '40001' then null; end;
  begin
    perform public.portal_save_workspace(current_setting('portal_test.user_b')::uuid, doc, 0);
    raise exception 'cross-account RPC was accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.portal_workspaces set user_id=current_setting('portal_test.user_b')::uuid;
    raise exception 'ownership reassignment was accepted';
  exception when insufficient_privilege then null; end;
  if not exists (select 1 from public.portal_workspaces where revision=2) then raise exception 'own read failed'; end if;
end $$;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('portal_test.user_b'),'role','authenticated')::text, true);
do $$ begin
  if exists (select 1 from public.portal_workspaces) then raise exception 'cross-account read leaked'; end if;
  update public.portal_workspaces set revision=999;
  if found then raise exception 'cross-account update succeeded'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform snapshot from public.portal_seed;
    raise exception 'anonymous seed read succeeded';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.portal_save_workspace(uuid,jsonb,bigint)','EXECUTE') then raise exception 'anonymous RPC permission'; end if;
end $$;
reset role;
rollback;
select 'PASS: owner isolation, cross-account denial, stale-revision rejection, anonymous denial; test users rolled back' as security_test;
