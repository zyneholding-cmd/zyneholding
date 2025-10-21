-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost_price decimal not null,
  color text not null,
  image text,
  created_at timestamptz default now()
);

-- Create sales table
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  customer text not null,
  contact text,
  address text,
  quantity decimal not null,
  sale_price decimal not null,
  total decimal not null,
  paid decimal not null,
  remaining decimal not null,
  profit decimal not null,
  payment_type text not null,
  method text not null,
  status text not null,
  date timestamptz not null,
  due_date timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS for defense-in-depth
alter table public.products enable row level security;
alter table public.sales enable row level security;

-- Since this is a password-protected single-user app, allow all operations
-- Anyone who has the password can access all data
create policy "Allow all access to products"
  on public.products
  for all
  using (true)
  with check (true);

create policy "Allow all access to sales"
  on public.sales
  for all
  using (true)
  with check (true);

-- Create indexes for better performance
create index idx_sales_product_id on public.sales(product_id);
create index idx_sales_status on public.sales(status);
create index idx_sales_date on public.sales(date);