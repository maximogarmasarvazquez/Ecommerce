-- ============================================
-- GRILLSTORE E-COMMERCE - SCHEMA PRODUCTION
-- Supabase + Seguridad + Roles + Inventario
-- ============================================

-- ============================================
-- 1. EXTENSIONES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1b. REVOCAR PERMISOS PUBLICOS POR DEFECTO
-- ============================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- ============================================
-- 2. LIMPIAR TABLAS Y FUNCIONES
-- ============================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;

DROP FUNCTION IF EXISTS is_admin CASCADE;
DROP FUNCTION IF EXISTS is_owner(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS validate_inventory CASCADE;
DROP FUNCTION IF EXISTS restore_inventory_on_cancel CASCADE;

-- ============================================
-- 3. TABLA PROFILES
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT,

    email TEXT NOT NULL UNIQUE,

    role TEXT NOT NULL DEFAULT 'customer'
    CHECK (
        role IN ('customer', 'admin')
    ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. TABLA PRODUCTS
-- ============================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    description TEXT,

    price INTEGER NOT NULL
    CHECK (price >= 0),

    category TEXT NOT NULL,

    images TEXT[] DEFAULT ARRAY[]::TEXT[],

    inventory INTEGER NOT NULL DEFAULT 0
    CHECK (inventory >= 0),

    is_featured BOOLEAN NOT NULL DEFAULT false,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. TABLA CUSTOMERS
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT,

    email TEXT NOT NULL UNIQUE,

    phone TEXT,

    shipping_address JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. TABLA ORDERS
-- ============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
        status IN (
            'pending',
            'paid',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),

    total_amount INTEGER NOT NULL
    CHECK (total_amount >= 0),

    shipping_cost INTEGER NOT NULL DEFAULT 0
    CHECK (shipping_cost >= 0),

    shipping_address JSONB DEFAULT '{}'::jsonb,

    external_reference TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. TABLA ORDER_ITEMS
-- ============================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE RESTRICT,

    quantity INTEGER NOT NULL
    CHECK (quantity > 0),

    unit_price INTEGER NOT NULL
    CHECK (unit_price >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(order_id, product_id)
);

-- ============================================
-- 8. INDEXES
-- ============================================

CREATE INDEX idx_profiles_role
ON profiles(role);

CREATE INDEX idx_products_category
ON products(category);

CREATE INDEX idx_products_active
ON products(is_active);

CREATE INDEX idx_orders_customer_id
ON orders(customer_id);

CREATE INDEX idx_order_items_order_id
ON order_items(order_id);

CREATE INDEX idx_customers_user_id
ON customers(user_id);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_products_featured
ON products(is_featured);

-- ============================================
-- 9. FUNCION updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- 10. TRIGGERS updated_at
-- ============================================

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. FUNCION ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
$$;

-- ============================================
-- 12. FUNCION OWNER
-- ============================================

CREATE OR REPLACE FUNCTION is_owner(owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
    SELECT auth.uid() = owner_id;
$$;

-- ============================================
-- 13. FUNCION CREAR PERFIL AUTOMATICO
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            ''
        ),
        'customer'
    );

    INSERT INTO public.customers (
        user_id,
        email,
        full_name
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            ''
        )
    );

    RETURN NEW;
END;
$$;

-- ============================================
-- 14. TRIGGER NUEVOS USUARIOS
-- ============================================

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 15. CREAR ORDEN (SERVER-SIDE TRANSACTION)
-- ============================================

CREATE OR REPLACE FUNCTION create_order(
    p_customer_id UUID,
    p_items JSONB,
    p_shipping_address JSONB,
    p_shipping_cost INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
    v_total INTEGER := 0;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_price INTEGER;
    v_inventory INTEGER;
BEGIN
    -- Validar carrito no vacio
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Carrito vacio';
    END IF;

    -- Validar direccion de envio
    IF p_shipping_address IS NULL
       OR p_shipping_address->>'name' IS NULL
       OR p_shipping_address->>'address' IS NULL
       OR p_shipping_address->>'city' IS NULL THEN
        RAISE EXCEPTION 'Direccion de envio incompleta';
    END IF;

    -- Crear orden
    INSERT INTO orders (
        customer_id,
        status,
        total_amount,
        shipping_cost,
        shipping_address
    ) VALUES (
        p_customer_id,
        'pending',
        0,
        p_shipping_cost,
        p_shipping_address
    )
    RETURNING id INTO v_order_id;

    -- Procesar cada item del carrito
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;

        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Cantidad invalida para producto %', v_product_id;
        END IF;

        -- Bloquear producto y obtener datos reales de DB
        SELECT price, inventory
        INTO v_price, v_inventory
        FROM products
        WHERE id = v_product_id
        FOR UPDATE;

        -- Validar que el producto exista
        IF v_price IS NULL THEN
            RAISE EXCEPTION 'Producto % inexistente', v_product_id;
        END IF;

        -- Validar inventario suficiente
        IF v_inventory < v_quantity THEN
            RAISE EXCEPTION 'Inventario insuficiente para producto %', v_product_id;
        END IF;

        -- Descontar inventario
        UPDATE products
        SET inventory = inventory - v_quantity
        WHERE id = v_product_id;

        -- Insertar item con precio REAL (no el enviado por frontend)
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price
        ) VALUES (
            v_order_id,
            v_product_id,
            v_quantity,
            v_price
        );

        v_total := v_total + (v_price * v_quantity);
    END LOOP;

    -- Actualizar total de la orden (calculado server-side)
    UPDATE orders
    SET total_amount = v_total + p_shipping_cost
    WHERE id = v_order_id;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'total_amount', v_total + p_shipping_cost
    );
END;
$$;

-- ============================================
-- 16. RESTAURAR INVENTARIO
-- ============================================

CREATE OR REPLACE FUNCTION restore_inventory_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    item RECORD;
BEGIN
    IF OLD.status != 'cancelled'
    AND NEW.status = 'cancelled' THEN
        FOR item IN
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = NEW.id
        LOOP
            UPDATE products
            SET inventory = inventory + item.quantity
            WHERE id = item.product_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================
-- 17. TRIGGER RESTAURAR INVENTARIO
-- ============================================

CREATE TRIGGER trigger_restore_inventory
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION restore_inventory_on_cancel();

-- ============================================
-- 18. HABILITAR RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 19. POLICIES PROFILES
-- ============================================

CREATE POLICY "Users view own profile"
ON profiles
FOR SELECT
USING (
    is_owner(id)
);

CREATE POLICY "Users update own profile"
ON profiles
FOR UPDATE
USING (
    is_owner(id)
)
WITH CHECK (
    is_owner(id)
    AND role = (
        SELECT role
        FROM profiles
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Admins select profiles"
ON profiles
FOR SELECT
USING (
    is_admin()
);

CREATE POLICY "Admins update profiles"
ON profiles
FOR UPDATE
USING (
    is_admin()
)
WITH CHECK (
    is_admin()
);

-- ============================================
-- 20. POLICIES PRODUCTS
-- ============================================

CREATE POLICY "Public view active products"
ON products
FOR SELECT
USING (
    is_active = true
);

CREATE POLICY "Admins insert products"
ON products
FOR INSERT
WITH CHECK (
    is_admin()
);

CREATE POLICY "Admins update products"
ON products
FOR UPDATE
USING (
    is_admin()
)
WITH CHECK (
    is_admin()
);

CREATE POLICY "Admins delete products"
ON products
FOR DELETE
USING (
    is_admin()
);

-- ============================================
-- 21. POLICIES CUSTOMERS
-- ============================================

CREATE POLICY "Users view own customer"
ON customers
FOR SELECT
USING (
    is_owner(user_id)
);

CREATE POLICY "Users update own customer"
ON customers
FOR UPDATE
USING (
    is_owner(user_id)
)
WITH CHECK (
    is_owner(user_id)
);

CREATE POLICY "Admins select customers"
ON customers
FOR SELECT
USING (
    is_admin()
);

CREATE POLICY "Admins update customers"
ON customers
FOR UPDATE
USING (
    is_admin()
)
WITH CHECK (
    is_admin()
);

CREATE POLICY "Admins delete customers"
ON customers
FOR DELETE
USING (
    is_admin()
);

-- ============================================
-- 22. POLICIES ORDERS
-- ============================================

CREATE POLICY "Users view own orders"
ON orders
FOR SELECT
USING (
    customer_id IN (
        SELECT id
        FROM customers
        WHERE user_id = auth.uid()
    )
);

-- Los inserts de orders SOLO se hacen via create_order() function (server-side)
-- Policy de INSERT eliminada por seguridad

CREATE POLICY "Admins select orders"
ON orders
FOR SELECT
USING (
    is_admin()
);

CREATE POLICY "Admins update orders"
ON orders
FOR UPDATE
USING (
    is_admin()
)
WITH CHECK (
    is_admin()
);

CREATE POLICY "Admins delete orders"
ON orders
FOR DELETE
USING (
    is_admin()
);

-- ============================================
-- 23. POLICIES ORDER_ITEMS
-- ============================================

CREATE POLICY "Users view own order items"
ON order_items
FOR SELECT
USING (
    order_id IN (
        SELECT o.id
        FROM orders o
        JOIN customers c
        ON c.id = o.customer_id
        WHERE c.user_id = auth.uid()
    )
);

-- Los inserts de order_items SOLO se via create_order() function (server-side)
-- Policy de INSERT eliminada por seguridad

CREATE POLICY "Admins select order items"
ON order_items
FOR SELECT
USING (
    is_admin()
);

CREATE POLICY "Admins update order items"
ON order_items
FOR UPDATE
USING (
    is_admin()
)
WITH CHECK (
    is_admin()
);

CREATE POLICY "Admins delete order items"
ON order_items
FOR DELETE
USING (
    is_admin()
);

-- ============================================
-- 24. PERMISOS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- PRODUCTS
GRANT SELECT
ON products
TO anon, authenticated;

-- CUSTOMERS
GRANT SELECT, UPDATE
ON customers
TO authenticated;

-- ORDERS: SOLO SELECT via RLS, INSERT via create_order()
GRANT SELECT
ON orders
TO authenticated;

-- ORDER ITEMS: SOLO SELECT via RLS, INSERT via create_order()
GRANT SELECT
ON order_items
TO authenticated;

-- PROFILES
GRANT SELECT, UPDATE
ON profiles
TO authenticated;

-- FUNCTION CREATE_ORDER
GRANT EXECUTE ON FUNCTION create_order TO authenticated;

-- SERVICE ROLE
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO service_role;

-- ============================================
-- 25. CREAR ADMIN
-- ============================================

-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'tu-email@ejemplo.com';