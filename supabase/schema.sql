-- E-commerce schema for grill store

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price integer not null, -- cents
  category text not null,
  images text[] default '{}',
  inventory integer default 0,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Customers table (extends auth.users)
create table customers (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'pending',
  total_amount integer not null,
  shipping_cost integer default 0,
  shipping_address jsonb,
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Order items table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null not null,
  quantity integer not null,
  unit_price integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies

-- Enable RLS
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;

-- Products: everyone can read
create policy "Products are viewable by everyone" on products
  for select using (is_active = true);

-- Products: only authenticated staff can insert/update/delete
create policy "Staff can manage products" on products
  for all using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'role' = 'staff'
    )
  );

-- Customers: users can read their own profile
create policy "Users can view own profile" on customers
  for select using (id = auth.uid());

create policy "Users can update own profile" on customers
  for update using (id = auth.uid());

-- Auto-create customer on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.customers (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Orders: users can read their own orders
create policy "Users can view own orders" on orders
  for select using (customer_id = auth.uid());

-- Order items: users can read their own order items
create policy "Users can view own order items" on order_items
  for select using (
    order_id in (
      select id from orders where customer_id = auth.uid()
    )
  );

-- Reviews: anyone can read, authenticated users can create
create policy "Reviews are viewable by everyone" on reviews
  for select using (true);

create policy "Authenticated users can create reviews" on reviews
  for insert with check (auth.uid() is not null);

-- Indexes for performance
create index idx_products_category on products(category);
create index idx_products_is_featured on products(is_featured);
create index idx_orders_customer_id on orders(customer_id);
create index idx_order_items_order_id on order_items(order_id);
create index idx_reviews_product_id on reviews(product_id);

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

create policy "Public access to product images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() in ('authenticated', 'service_role')
  );

create policy "Staff can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'role' = 'staff'
    )
  );