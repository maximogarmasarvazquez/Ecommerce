-- Sample products for GrillStore
-- Run this after schema.sql to populate initial data

-- Parrillas de Gas
INSERT INTO products (name, description, price, category, images, inventory, is_featured, is_active) VALUES
('Parrilla Weber Spirit E-320', 'Parrilla a gas de 3 quemadores, perfecta para familias. Incluye termómetro en tapa y mesas laterales plegables.', 249990, 'gas', ARRAY['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800'], 15, true, true),
('Parrilla Char-Broil Performance', 'Parrilla de gas con 4 quemadores, potente y duradera. Acero inoxidable de alta calidad.', 189990, 'gas', ARRAY['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800'], 10, true, true),
('Parrilla Weber Q 1200', 'Parrilla portable a gas, ideal para espacios pequeños y camping. Compacta y funcional.', 149990, 'gas', ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'], 20, false, true),

-- Parrillas de Carbón
('Parrilla Weber Original Kettle Premium', 'Parrilla de carbón clásica de 57cm. Tecnología One-Touch para control de aire.', 89990, 'carbon', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], 25, true, true),
('Parrilla Kamado Joe Classic II', 'Parrilla estilo kamado de cerámica. Excelente retención de calor para asados lenta.', 349990, 'carbon', ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'], 5, true, true),
('Parrilla Blackstone 36 inch', 'Parrilla de carbón con superficie de cocción extragrande. Perfecta para reuniones grandes.', 129990, 'carbon', ARRAY['https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800'], 12, false, true),

-- Accesorios
('Set de Utensilios Weber 6 piezas', 'Set completo de utensilios de acero inoxidable. Incluye pinzas, espátula, tenedor y más.', 24990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'], 50, false, true),
('Termómetro Digital Weber', 'Termómetro de lectura rápida para verificar cocción perfecta de tus meats.', 12990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1604470591969-45a3e2f594a4?w=800'], 30, false, true),
('Funda para Parrilla Weber', 'Funda resistente al agua y UV. Protege tu parrilla de los elementos.', 19990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 40, false, true),
('Kit de Inicio Carbón Weber', 'Incluye bolsa de carbón y encendedor. Todo lo necesario para tu primer asado.', 8990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1523309996740-d5315f9cc28b?w=800'], 100, false, true),
('Guantes de Cocción Residentes', 'Guantes de Aramida resistencia hasta 500°C. Perfectos para manipular parillas.', 14990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1585675397312-9e5e7c4c73a4?w=800'], 35, false, true),
('Cepillo Limpiador de Acero Inoxidable', 'Cepillo profesional para limpiar rejillas. Acero inoxidable duradero.', 4990, 'accesorios', ARRAY['https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800'], 60, false, true);

-- Products are viewable by everyone (active only)