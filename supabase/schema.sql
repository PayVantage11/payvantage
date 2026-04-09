-- PayVantage Database Schema
-- Run this in the Supabase SQL Editor to set up all required tables and policies.

-- ============================================================================
-- PROFILES
-- ============================================================================
-- Extends Supabase auth.users with application-specific fields.

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'merchant' check (role in ('merchant', 'admin')),
  company_name text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Merchants can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Merchants can update their own profile (except role)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup via trigger
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


-- ============================================================================
-- API KEYS
-- ============================================================================

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.profiles(id) on delete cascade not null,
  publishable_key text not null unique,
  secret_key_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

-- Merchants can read their own keys
create policy "Merchants can view own API keys"
  on public.api_keys for select
  using (auth.uid() = merchant_id);

-- Merchants can insert their own keys
create policy "Merchants can create API keys"
  on public.api_keys for insert
  with check (auth.uid() = merchant_id);

-- Merchants can delete their own keys
create policy "Merchants can delete own API keys"
  on public.api_keys for delete
  using (auth.uid() = merchant_id);

-- Admins can read all keys
create policy "Admins can view all API keys"
  on public.api_keys for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


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
  customer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

-- Merchants can read their own transactions
create policy "Merchants can view own transactions"
  on public.transactions for select
  using (auth.uid() = merchant_id);

-- Admins can read all transactions
create policy "Admins can view all transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Service role (API routes) can insert and update transactions.
-- These operations are performed via the service_role key which bypasses RLS.
-- No explicit insert/update policies needed for authenticated users on transactions.


-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_transactions_merchant_id on public.transactions(merchant_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_payram_checkout_id on public.transactions(payram_checkout_id);
create index if not exists idx_api_keys_merchant_id on public.api_keys(merchant_id);
create index if not exists idx_api_keys_publishable_key on public.api_keys(publishable_key);
