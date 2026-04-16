-- PayVantage Database Schema
-- Run this in the Supabase SQL Editor to set up all required tables and policies.
-- Safe to re-run: drops and recreates policies, adds missing columns.

-- ============================================================================
-- PROFILES
-- ============================================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'merchant' check (role in ('merchant', 'admin')),
  company_name text,
  approved boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists onboarded boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_platform_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_platform_admin());

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Used by Next.js middleware / layouts: reads role without going through RLS,
-- so admin promotion in SQL is always visible on the next request.
create or replace function public.get_session_profile()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'role', p.role,
    'onboarded', p.onboarded,
    'approved', p.approved
  )
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_session_profile() from public;
grant execute on function public.get_session_profile() to authenticated;
grant execute on function public.get_session_profile() to service_role;

-- Admin checks for RLS must NOT subquery public.profiles directly from a
-- profiles policy (infinite recursion). Use this definer helper instead.
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select p.role = 'admin'
      from public.profiles p
      where p.id = auth.uid()
    ),
    false
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_platform_admin() to service_role;

-- Backfill if the auth.users trigger did not create a row (legacy users, failed trigger).
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


-- ============================================================================
-- MERCHANT SETTINGS (includes business verification / KYC fields)
-- ============================================================================

create table if not exists public.merchant_settings (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.profiles(id) on delete cascade not null unique,

  -- Business basics
  company_name text,
  business_type text,
  website_url text,

  -- Business verification / KYC
  legal_business_name text,
  business_registration_number text,
  country text,
  business_address text,
  city text,
  state_province text,
  postal_code text,
  representative_first_name text,
  representative_last_name text,
  representative_email text,
  representative_phone text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verification_notes text,

  -- Integration settings
  webhook_url text,
  wallet_address text,
  preferred_chain text default 'BASE',

  -- Multi-rail routing
  payment_rail text not null default 'payram' check (payment_rail in ('payram', 'inqud', 'alchemypay')),
  fallback_rail text check (fallback_rail is null or fallback_rail in ('payram', 'inqud', 'alchemypay')),
  rail_config jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add new columns that may not exist from older schema
alter table public.merchant_settings add column if not exists legal_business_name text;
alter table public.merchant_settings add column if not exists business_registration_number text;
alter table public.merchant_settings add column if not exists country text;
alter table public.merchant_settings add column if not exists business_address text;
alter table public.merchant_settings add column if not exists city text;
alter table public.merchant_settings add column if not exists state_province text;
alter table public.merchant_settings add column if not exists postal_code text;
alter table public.merchant_settings add column if not exists representative_first_name text;
alter table public.merchant_settings add column if not exists representative_last_name text;
alter table public.merchant_settings add column if not exists representative_email text;
alter table public.merchant_settings add column if not exists representative_phone text;
alter table public.merchant_settings add column if not exists verification_status text not null default 'pending';
alter table public.merchant_settings add column if not exists verification_notes text;
alter table public.merchant_settings add column if not exists payment_rail text not null default 'payram';
alter table public.merchant_settings add column if not exists fallback_rail text;
alter table public.merchant_settings add column if not exists rail_config jsonb not null default '{}'::jsonb;
alter table public.merchant_settings add column if not exists application_submitted_at timestamptz;
alter table public.merchant_settings add column if not exists business_description text;
alter table public.merchant_settings add column if not exists expected_monthly_volume text;
alter table public.merchant_settings add column if not exists cold_wallet_address text;
alter table public.merchant_settings add column if not exists settlement_notes text;
alter table public.merchant_settings add column if not exists payram_success_redirect_url text;
alter table public.merchant_settings add column if not exists payram_cancel_redirect_url text;

alter table public.merchant_settings enable row level security;

drop policy if exists "Merchants can view own settings" on public.merchant_settings;
create policy "Merchants can view own settings"
  on public.merchant_settings for select
  using (auth.uid() = merchant_id);

drop policy if exists "Merchants can insert own settings" on public.merchant_settings;
create policy "Merchants can insert own settings"
  on public.merchant_settings for insert
  with check (auth.uid() = merchant_id);

drop policy if exists "Merchants can update own settings" on public.merchant_settings;
create policy "Merchants can update own settings"
  on public.merchant_settings for update
  using (auth.uid() = merchant_id);

drop policy if exists "Admins can view all settings" on public.merchant_settings;
create policy "Admins can view all settings"
  on public.merchant_settings for select
  using (public.is_platform_admin());

drop policy if exists "Admins can update all settings" on public.merchant_settings;
create policy "Admins can update all settings"
  on public.merchant_settings for update
  using (public.is_platform_admin());


-- ============================================================================
-- MERCHANT PAYRAM CREDENTIALS (server + admin only — not readable by merchants)
-- API key selects the PayRam project on the processor; optional base URL override.
-- ============================================================================

create table if not exists public.merchant_payram_credentials (
  merchant_id uuid primary key references public.profiles(id) on delete cascade,
  payram_project_id text,
  payram_project_name text,
  api_key text not null,
  payram_base_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.merchant_payram_credentials enable row level security;

drop policy if exists "Admins manage merchant PayRam credentials" on public.merchant_payram_credentials;
create policy "Admins manage merchant PayRam credentials"
  on public.merchant_payram_credentials for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- One PayRam API key = one processor project; prevent assigning the same key to two merchants.
create unique index if not exists idx_merchant_payram_credentials_api_key_unique
  on public.merchant_payram_credentials (api_key);


-- ============================================================================
-- API KEYS
-- ============================================================================

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.profiles(id) on delete cascade not null,
  label text not null default 'Default',
  publishable_key text not null unique,
  secret_key_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.api_keys add column if not exists label text not null default 'Default';
alter table public.api_keys add column if not exists is_active boolean not null default true;

alter table public.api_keys enable row level security;

drop policy if exists "Merchants can view own API keys" on public.api_keys;
create policy "Merchants can view own API keys"
  on public.api_keys for select
  using (auth.uid() = merchant_id);

drop policy if exists "Merchants can create API keys" on public.api_keys;
create policy "Merchants can create API keys"
  on public.api_keys for insert
  with check (auth.uid() = merchant_id);

drop policy if exists "Merchants can update own API keys" on public.api_keys;
create policy "Merchants can update own API keys"
  on public.api_keys for update
  using (auth.uid() = merchant_id);

drop policy if exists "Merchants can delete own API keys" on public.api_keys;
create policy "Merchants can delete own API keys"
  on public.api_keys for delete
  using (auth.uid() = merchant_id);

drop policy if exists "Admins can view all API keys" on public.api_keys;
create policy "Admins can view all API keys"
  on public.api_keys for select
  using (public.is_platform_admin());


-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  payram_checkout_id text unique,
  payram_reference_id text unique,
  payment_rail text,
  provider_order_id text,
  provider_reference text,
  customer_email text,
  customer_id text,
  payment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions add column if not exists payram_reference_id text unique;
alter table public.transactions add column if not exists customer_id text;
alter table public.transactions add column if not exists payment_url text;
alter table public.transactions add column if not exists payment_rail text;
alter table public.transactions add column if not exists provider_order_id text;
alter table public.transactions add column if not exists provider_reference text;

alter table public.transactions enable row level security;

drop policy if exists "Merchants can view own transactions" on public.transactions;
create policy "Merchants can view own transactions"
  on public.transactions for select
  using (auth.uid() = merchant_id);

drop policy if exists "Admins can view all transactions" on public.transactions;
create policy "Admins can view all transactions"
  on public.transactions for select
  using (public.is_platform_admin());


-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_transactions_merchant_id on public.transactions(merchant_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_payram_checkout_id on public.transactions(payram_checkout_id);
create index if not exists idx_transactions_payram_reference_id on public.transactions(payram_reference_id);
create index if not exists idx_transactions_provider_order_id on public.transactions(provider_order_id);
create index if not exists idx_transactions_payment_rail on public.transactions(payment_rail);
create index if not exists idx_api_keys_merchant_id on public.api_keys(merchant_id);
create index if not exists idx_api_keys_publishable_key on public.api_keys(publishable_key);
create index if not exists idx_merchant_settings_merchant_id on public.merchant_settings(merchant_id);


-- ============================================================================
-- ADMIN SEED
-- ============================================================================
-- After creating your admin account via the normal signup flow, run this
-- replacing 'your-admin@email.com' with your actual email:
--
--   UPDATE public.profiles
--   SET role = 'admin', approved = true, onboarded = true
--   WHERE email = 'your-admin@email.com';
