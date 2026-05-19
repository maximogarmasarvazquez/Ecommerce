-- ============================================
-- CLEANUP: Reset database (run this to reset everything)
-- ============================================

-- Drop tables (use DO block to avoid errors if tables don't exist)
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    inventory INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount INTEGER NOT NULL,
    shipping_cost INTEGER DEFAULT 0,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read (active and inactive for admin, only active for public)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (
        is_active = true 
        OR exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role' = 'admin')
    );

-- Products: admin can manage
CREATE POLICY "Admin can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Customers: users can read/update own profile
CREATE POLICY "Users can view own profile" ON customers
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON customers
    FOR UPDATE USING (id = auth.uid());

-- Auto-create customer on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Orders: users can read own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

-- Order items: users can read own order items
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id = auth.uid()
        )
    );

-- Reviews: anyone can read, authenticated users can create
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- ============================================
-- STORAGE
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to product images" ON storage.objects;
CREATE POLICY "Public access to product images"
    ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'product-images'
        AND auth.role() IN ('authenticated', 'service_role')
    );

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images"
    ON storage.objects FOR DELETE USING (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- SAMPLE PRODUCTS
-- ============================================

INSERT INTO products (name, description, price, category, images, inventory, is_featured, is_active) VALUES
('Parrilla Weber Spirit E-320', 'Parrilla a gas de 3 quemadores, perfecta para familias. Incluye termómetro en tapa.', 249990, 'gas', ARRAY['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800'], 15, true, true),
('Parrilla Char-Broil Performance', 'Parrilla de gas con 4 quemadores, acero inoxidable de alta calidad.', 189990, 'gas', ARRAY['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800'], 10, true, true),
('Parrilla Weber Q 1200', 'Parrilla portable a gas, ideal para espacios pequeños y camping.', 149990, 'gas', ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'], 20, false, true),
('Parrilla Weber Original Kettle Premium', 'Parrilla de carbón clásica de 57cm con tecnología One-Touch.', 89990, 'carbon', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], 25, true, true),
('Parrilla Kamado Joe Classic II', 'Parrilla estilo kamado de cerámica, excelente retención de calor.', 349990, 'carbon', ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'], 5, true, true),
('Parrilla Blackstone 36 inch', 'Parrilla de carbón con superficie extragrande, perfecta para reuniones.', 129990, 'carbon', ARRAY['https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800'], 12, false, true),
('Set de Utensilios Weber 6 piezas', 'Set completo de utensilios de acero inoxidable.', 24990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'], 50, false, true),
('Termómetro Digital Weber', 'Termómetro de lectura rápida para cocción perfecta.', 12990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1604470591969-45a3e2f594a4?w=800'], 30, false, true),
('Funda para Parrilla Weber', 'Funda resistente al agua y UV.', 19990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 40, false, true),
('Kit de Inicio Carbón Weber', 'Incluye bolsa de carbón y encendedor.', 8990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1523309996740-d5315f9cc28b?w=800'], 100, false, true),
('Guantes de Cocción Residentes', 'Guantes de Aramida resistencia hasta 500°C.', 14990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1585675397312-9e5e7c4c73a4?w=800'], 35, false, true),
('Cepillo Limpiador de Acero', 'Cepillo profesional para limpiar rejillas.', 4990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800'], 60, false, true);

-- ============================================
-- MAKE USER ADMIN
-- ============================================
