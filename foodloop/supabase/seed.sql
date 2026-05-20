-- ============================================================
-- FoodLoop — Seed data (15 publicaciones de ejemplo)
-- IMPORTANTE: Ejecutar DESPUÉS del schema.sql
-- Requiere 2 usuarios ya registrados en la app; sustituir los
-- UUIDs por los reales de auth.users tras registrarlos.
-- ============================================================

-- Para hacer un seed rápido sin usuarios reales, descomenta y
-- ajusta los UUIDs una vez que hayas creado 2 cuentas desde la app.

/*
-- Seed posts (ajusta user_id con UUIDs reales de profiles)
insert into posts (user_id, title, description, image_url, expiration_date, pickup_location, offer_type, status) values
  ('USER_UUID_1', 'Arroz integral cocido', 'Sobró de la cena, aprox 2 tazas', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400', current_date + 1, 'Edificio A, piso 2, depto 201', 'free', 'available'),
  ('USER_UUID_1', 'Pan integral artesanal', 'Media barra sin abrir', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', current_date + 2, 'Cafetería central, mostrador', 'free', 'available'),
  ('USER_UUID_2', 'Manzanas golden', 'Bolsa de 6 manzanas, muy frescas', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', current_date + 3, 'Residencia universitaria, recepción', 'free', 'available'),
  ('USER_UUID_1', 'Caldo de verduras', '1 litro en recipiente con tapa', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', current_date + 0, 'Departamento 305, llamar al timbre', 'free', 'available'),
  ('USER_UUID_2', 'Tacos de canasta (10 pzas)', 'Cierre de día, precio simbólico', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', current_date + 0, 'Taquería El Güero, frente al campus', 'symbolic', 'available'),
  ('USER_UUID_1', 'Yogur natural sin abrir', 'Cad. mañana, no lo voy a consumir', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', current_date + 1, 'Edificio B, buzón', 'free', 'available'),
  ('USER_UUID_2', 'Enchiladas verdes (6 pzas)', 'Sobraron del servicio del mediodía', 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=400', current_date + 0, 'Cafetería universitaria, ventana trasera', 'free', 'available'),
  ('USER_UUID_1', 'Plátanos maduros (6 pzas)', 'Perfectos para licuado o pan de plátano', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', current_date + 1, 'Casa azul enfrente de la biblioteca', 'free', 'available'),
  ('USER_UUID_2', 'Sopa de lentejas', '2 porciones en contenedor de vidrio', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', current_date + 2, 'Laboratorio de cómputo, entrada', 'free', 'available'),
  ('USER_UUID_1', 'Queso panela (bloque 200g)', 'Sin abrir, cad. en 3 días', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', current_date + 3, 'Depto 102, planta baja', 'free', 'available'),
  ('USER_UUID_2', 'Pozole rojo (3 platos)', 'Recién hecho esta mañana', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', current_date + 0, 'Comedor estudiantil, barra 2', 'symbolic', 'available'),
  ('USER_UUID_1', 'Tortillas de maíz (20 pzas)', 'Del día, sin abrir', 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?w=400', current_date + 1, 'Edificio C, tercer piso', 'free', 'available'),
  ('USER_UUID_2', 'Fruta picada (papaya y melón)', 'Envase de 500g, preparada hoy', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400', current_date + 0, 'Puesto de jugos campus norte', 'free', 'available'),
  ('USER_UUID_1', 'Chiles rellenos (4 pzas)', 'Sobraron de la cena, en refri', 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', current_date + 1, 'Depto 210, segundo piso', 'free', 'available'),
  ('USER_UUID_2', 'Agua de Jamaica (1.5 litros)', 'En jarra, sin azúcar extra', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', current_date + 0, 'Cafetería sur, barra de bebidas', 'free', 'available');
*/

-- Para probar sin seed manual, la app funciona con publicaciones creadas desde la UI.
select 'Seed listo. Descomenta el bloque anterior y sustituye USER_UUID_1 y USER_UUID_2 con UUIDs reales de profiles.' as instrucciones;
