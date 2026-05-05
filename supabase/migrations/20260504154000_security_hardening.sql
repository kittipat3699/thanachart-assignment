create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.admin_profiles enable row level security;

create index if not exists stock_movements_order_id_idx
  on public.stock_movements (order_id);

create index if not exists stock_movements_adjusted_by_idx
  on public.stock_movements (adjusted_by);
