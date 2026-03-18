INSERT INTO users (email, full_name, password)
VALUES
  ('mihail1@example.com', 'Mihail One', 'pass123'),
  ('mihail2@example.com', 'Mihail Two', 'pass123'),
  ('mihail3@example.com', 'Mihail Three', 'pass123'),
  ('mihail4@example.com', 'Mihail Four', 'pass123'),
  ('mihail5@example.com', 'Mihail Five', 'pass123')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (sku, name, category, description, price, stock)
VALUES
  ('SKU-1001', 'Mechanical Keyboard TKL', 'electronics', 'Compact keyboard for fast typing sessions', 79.99, 200),
  ('SKU-1002', 'Gaming Mouse Pro', 'electronics', 'Lightweight mouse with optical sensor', 49.90, 250),
  ('SKU-1003', 'USB-C Dock Station', 'electronics', 'Dock station for laptops and monitors', 119.00, 120),
  ('SKU-1004', 'Notebook Stand', 'office', 'Aluminium stand for ergonomic setup', 35.50, 300),
  ('SKU-1005', '4K Monitor 27', 'electronics', 'High-resolution display for work and gaming', 329.99, 75),
  ('SKU-1006', 'Noise Cancelling Headphones', 'audio', 'Wireless headphones with ANC', 189.00, 90),
  ('SKU-1007', 'Smart Lamp', 'home', 'LED lamp with adjustable color temperature', 42.99, 180),
  ('SKU-1008', 'Desk Pad XL', 'office', 'Large desk pad for keyboard and mouse', 18.90, 400),
  ('SKU-1009', 'Portable SSD 1TB', 'electronics', 'Fast external SSD for backups', 99.00, 160),
  ('SKU-1010', 'Bluetooth Speaker', 'audio', 'Portable speaker with long battery life', 55.90, 210),
  ('SKU-1011', 'Webcam Full HD', 'electronics', 'Camera for calls and streaming', 64.50, 140),
  ('SKU-1012', 'Office Chair Basic', 'office', 'Entry-level office chair', 139.00, 60),
  ('SKU-1013', 'Laptop Backpack', 'bags', 'Water-resistant backpack for daily commute', 47.20, 190),
  ('SKU-1014', 'Ceramic Mug', 'home', 'Simple mug for coffee and tea', 9.90, 500),
  ('SKU-1015', 'Standing Desk Frame', 'office', 'Electric standing desk frame', 289.00, 40),
  ('SKU-1016', 'Wi-Fi Router AX', 'electronics', 'Wi-Fi 6 router for apartment and office', 129.00, 100),
  ('SKU-1017', 'Microphone USB', 'audio', 'USB microphone for podcasts and meetings', 72.00, 85),
  ('SKU-1018', 'Cable Organizer Kit', 'office', 'Set of clips and cable sleeves', 14.30, 350),
  ('SKU-1019', 'Monitor Arm Dual', 'office', 'Dual monitor arm with gas spring', 88.00, 110),
  ('SKU-1020', 'Action Camera', 'electronics', 'Compact camera for outdoor recording', 210.00, 55)
ON CONFLICT (sku) DO NOTHING;
