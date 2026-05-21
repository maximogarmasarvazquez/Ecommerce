-- ============================================
-- GRILLSTORE E-COMMERCE - DATOS INICIALES
-- Este archivo debe ejecutarse DESPUES de schema.sql
-- ============================================

-- ============================================
-- 1. CATEGORIAS
-- ============================================

INSERT INTO categories (name, slug)
VALUES
    ('Gas', 'gas'),
    ('Carbon', 'carbon'),
    ('Accesorios', 'accesorios');

-- ============================================
-- 2. PRODUCTOS DE EJEMPLO
-- ============================================

INSERT INTO products (
    name,
    description,
    price,
    category,
    images,
    inventory,
    is_featured,
    is_active
)
VALUES
-- Parrillas de Gas
(
    'Parrilla Weber Spirit E-320',
    'Parrilla a gas de 3 quemadores, perfecta para familias. Incluye termometro en tapa y mesas laterales plegables.',
    249990,
    'gas',
    ARRAY['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800'],
    15,
    true,
    true
),
(
    'Parrilla Char-Broil Performance',
    'Parrilla de gas con 4 quemadores, potente y duradera. Acero inoxidable de alta calidad.',
    189990,
    'gas',
    ARRAY['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800'],
    10,
    true,
    true
),
(
    'Parrilla Weber Q 1200',
    'Parrilla portable a gas, ideal para espacios pequenos y camping. Compacta y funcional.',
    149990,
    'gas',
    ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'],
    20,
    false,
    true
),

-- Parrillas de Carbon
(
    'Parrilla Weber Original Kettle Premium',
    'Parrilla de carbon clasica de 57cm. Tecnologia One-Touch para control de aire.',
    89990,
    'carbon',
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    25,
    true,
    true
),

-- Accesorios
(
    'Cepillo Limpiador de Acero Inoxidable',
    'Cepillo profesional para limpiar rejillas. Acero inoxidable duradero.',
    4990,
    'accesorios',
    ARRAY['https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800'],
    60,
    false,
    true
);

-- ============================================
-- 3. VERIFICACION
-- ============================================

SELECT
    'Categorias: ' || (SELECT COUNT(*)::TEXT FROM categories) || ', Productos: ' || COUNT(*)::TEXT AS mensaje
FROM products;
