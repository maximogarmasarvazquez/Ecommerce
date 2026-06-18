-- ============================================
-- BOTANIC STORE - DATOS INICIALES
-- ============================================

-- ============================================
-- CATEGORIAS
-- ============================================

INSERT INTO categories (name, slug)
VALUES
    ('Interior', 'interior'),
    ('Exterior', 'exterior'),
    ('Suculentas', 'suculentas'),
    ('Macetas', 'macetas'),
    ('Accesorios', 'accesorios');

-- ============================================
-- PRODUCTOS
-- ============================================

INSERT INTO products (
    name,
    description,
    price,
    category,
    images,
    inventory,
    weight_grams,
    width_cm,
    height_cm,
    depth_cm,
    is_featured,
    is_active
)
VALUES

-- INTERIOR
(
    'Monstera Deliciosa',
    'La clásica costilla de Adán. Hojas grandes y frondosas que aportan un toque tropical a cualquier espacio interior.',
    4599,
    'interior',
    ARRAY['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800'],
    12,
    3000,
    40,
    80,
    40,
    true,
    true
),
(
    'Sansevieria Trifasciata',
    'Lengua de suegra, la planta más resistente. Ideal para principiantes, purifica el aire y requiere mínimo cuidado.',
    2999,
    'interior',
    ARRAY['https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=800'],
    25,
    2000,
    25,
    70,
    25,
    false,
    true
),
(
    'Ficus Lyrata',
    'El elegante Ficus hoja de violín. Perfecto para rincones con luz indirecta, un statement piece natural.',
    8999,
    'interior',
    ARRAY['https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=800'],
     8,
     5000,
     50,
     120,
     50,
     true,
     true
),
(
    'Pothos Dorado',
    'Planta colgante de fácil cuidado. Ideal para estanterías o macetas colgantes, purifica el aire y crece rápido.',
    1999,
    'interior',
    ARRAY['https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=800'],
    35,
    1000,
    20,
    25,
    20,
    false,
    true
),
(
    'Helecho Boston',
    'Helecho frondoso de color verde brillante. Aporta frescura y textura a cualquier ambiente interior.',
    3299,
    'interior',
    ARRAY['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800'],
    15,
    2500,
    35,
    50,
    35,
    false,
    true
),

-- EXTERIOR
(
    'Lavanda Francesa',
    'Planta aromática de exterior con flores violetas. Ideal para jardines y balcones soleados, atrae mariposas.',
    2499,
    'exterior',
    ARRAY['https://images.unsplash.com/photo-1748442523012-210c2e6eac3d?w=800'],
    40,
    800,
    25,
    40,
    25,
    true,
    true
),
(
    'Jazmín Trepador',
    'Enredadera de flores blancas con fragancia dulce. Perfecta para pérgolas, cercos o balcones.',
    3999,
    'exterior',
    ARRAY['https://images.unsplash.com/photo-1771777598585-ad12bdd3848b?w=800'],
    18,
    2000,
    20,
    100,
    20,
    false,
    true
),
(
    'Hortensia Azul',
    'Arbusto florífero de exterior con enormes flores azules. Requiere suelo ácido y semisombra.',
    5499,
    'exterior',
    ARRAY['https://images.unsplash.com/photo-1721185040088-985a5a9ed477?w=800'],
    10,
    3500,
    40,
    60,
    40,
    true,
    true
),

-- SUCULENTAS
(
    'Cactus San Pedro',
    'Cactus columnar de rápido crecimiento. Ideal para exteriores soleados, muy decorativo y fácil de mantener.',
    3499,
    'suculentas',
    ARRAY['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800'],
    30,
    1500,
    15,
    60,
    15,
    true,
    true
),
(
    'Aloe Vera',
    'Planta suculenta con propiedades medicinales. Ideal para interiores luminosos, requiere poco riego.',
    2799,
    'suculentas',
    ARRAY['https://images.unsplash.com/photo-1632380211596-b96123618ca8?w=800'],
    22,
    1200,
    20,
    40,
    20,
    false,
    true
),
(
    'Echeveria Elegans',
    'Suculenta en roseta de color verde azulado. Perfecta para terrarios, macetas pequeñas y compositiones.',
    1599,
    'suculentas',
    ARRAY['https://images.unsplash.com/photo-1553256791-d251a54449b1?w=800'],
    50,
    300,
    10,
    10,
    10,
    false,
    true
),

-- MACETAS
(
    'Maceta Cerámica Artesanal',
    'Maceta hecha a mano con cerámica de alta calidad. Incluye agujero de drenaje y plato base.',
    2499,
    'macetas',
    ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'],
    40,
    800,
    20,
    22,
    20,
    false,
    true
),
(
    'Maceta Colgante Macramé',
    'Maceta colgante tejida a mano con fibra natural. Incluye maceta interior de plástico con drenaje.',
    3299,
    'macetas',
    ARRAY['https://images.unsplash.com/photo-1665287729089-facf1332d1a4?w=800'],
    20,
    500,
    18,
    100,
    18,
    true,
    true
),
(
    'Maceta Terracota Clásica',
    'Maceta de terracota natural de 20cm. Material poroso que permite la respiración de las raíces.',
    999,
    'macetas',
    ARRAY['https://images.unsplash.com/photo-1536331961048-d2ee3c9b751f?w=800'],
    60,
    600,
    20,
    18,
    20,
    false,
    true
),

-- ACCESORIOS
(
    'Fertilizante Orgánico 500ml',
    'Fertilizante líquido orgánico para plantas de interior y exterior. Rico en nutrientes esenciales.',
    1299,
    'accesorios',
    ARRAY['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800'],
    45,
    500,
    8,
    20,
    8,
    false,
    true
),
(
    'Regadera Metálica 1.5L',
    'Regadera de metal con acabado pintado. Capacidad de 1.5 litros con pico largo para riego preciso.',
    2199,
    'accesorios',
    ARRAY['https://images.unsplash.com/photo-1749414418679-39da8b9788b4?w=800'],
    30,
    400,
    15,
    25,
    30,
    false,
    true
),
(
    'Kit de Herramientas para Jardinería',
    'Set de 3 herramientas: pala, trasplantador y rastrillo. Mangos de madera con cabezal de acero inoxidable.',
    3499,
    'accesorios',
    ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
    25,
    600,
    15,
    35,
    10,
    true,
    true
);

-- ============================================
-- CREAR USUARIO ADMIN
-- ============================================
-- Para crear un admin, registrate via /register, luego ejecuta:
--
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'tu@email.com';
--
-- Despues deslogueate y volve a iniciar sesion para refrescar el JWT.

-- ============================================
-- RESUMEN
-- ============================================

SELECT
    'Categorias: ' || (SELECT COUNT(*)::TEXT FROM categories) || ', Productos: ' || COUNT(*)::TEXT AS mensaje
FROM products;
