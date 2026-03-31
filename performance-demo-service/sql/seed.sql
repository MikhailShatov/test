INSERT INTO users (email, full_name, password)
SELECT
  'mihail' || gs || '@example.com',
  'Mihail User ' || gs,
  'pass123'
FROM generate_series(1, 200) AS gs
ON CONFLICT (email) DO NOTHING;

INSERT INTO carts (user_id)
SELECT u.id
FROM users u
LEFT JOIN carts c ON c.user_id = u.id
WHERE c.user_id IS NULL;

INSERT INTO products (sku, name, category, description, price, stock)
SELECT
  'SKU-' || LPAD(gs::text, 5, '0'),
  CASE (gs % 8)
    WHEN 0 THEN 'Mechanical Keyboard ' || gs
    WHEN 1 THEN 'Gaming Mouse ' || gs
    WHEN 2 THEN 'USB-C Dock ' || gs
    WHEN 3 THEN 'Monitor ' || gs
    WHEN 4 THEN 'Headphones ' || gs
    WHEN 5 THEN 'Office Chair ' || gs
    WHEN 6 THEN 'Laptop Backpack ' || gs
    ELSE 'Webcam ' || gs
  END,
  CASE (gs % 6)
    WHEN 0 THEN 'electronics'
    WHEN 1 THEN 'office'
    WHEN 2 THEN 'audio'
    WHEN 3 THEN 'home'
    WHEN 4 THEN 'bags'
    ELSE 'accessories'
  END,
  'Seeded demo product #' || gs || ' for performance testing scenarios',
  ROUND((15 + (gs % 40) * 7.25)::numeric, 2),
  500 + (gs % 20) * 50
FROM generate_series(1, 200) AS gs
ON CONFLICT (sku) DO NOTHING;