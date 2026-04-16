-- Creates public.profiles row from auth.users if missing (fixes FK on merchant_settings).
-- Run in Supabase SQL Editor. Safe to re-run.

create or replace function public.ensure_merchant_profile()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, company_name)
  select
    u.id,
    coalesce(u.email::text, ''),
    coalesce(u.raw_user_meta_data->>'company_name', '')
  from auth.users u
  where u.id = auth.uid()
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.ensure_merchant_profile() from public;
grant execute on function public.ensure_merchant_profile() to authenticated;
grant execute on function public.ensure_merchant_profile() to service_role;

-- Optional one-time backfill (run as SQL editor; uses table owner, bypasses RLS):
-- insert into public.profiles (id, email, company_name)
-- select au.id, coalesce(au.email::text, ''), coalesce(au.raw_user_meta_data->>'company_name', '')
-- from auth.users au
-- where not exists (select 1 from public.profiles p where p.id = au.id)
-- on conflict (id) do nothing;
