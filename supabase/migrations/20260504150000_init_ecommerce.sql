create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  description text not null default '',
  price numeric(12, 2) not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists items_is_active_idx on public.items (is_active);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  currency text not null default 'THB',
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id uuid not null references public.items(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_item_id_idx on public.order_items (item_id);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  delta integer not null,
  reason text not null,
  source text not null check (source in ('admin_adjustment', 'order_checkout')),
  order_id uuid references public.orders(id) on delete set null,
  adjusted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists stock_movements_item_id_idx on public.stock_movements (item_id, created_at desc);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_profiles_is_active_idx on public.admin_profiles (is_active);

create trigger trg_items_set_updated_at
before update on public.items
for each row
execute function public.set_updated_at();

create trigger trg_orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create trigger trg_admin_profiles_set_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();
