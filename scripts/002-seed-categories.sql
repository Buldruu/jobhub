-- Add unique constraint on category name first
ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);

-- Insert categories with proper Mongolian names
INSERT INTO categories (name, name_mn, icon) VALUES
  ('Construction', 'Барилга', 'building'),
  ('Delivery', 'Хүргэлт', 'truck'),
  ('Food Service', 'Хоол үйлчилгээ', 'utensils'),
  ('Cleaning', 'Цэвэрлэгээ', 'sparkles'),
  ('Repair', 'Засвар', 'wrench'),
  ('Sales', 'Борлуулалт', 'shopping-bag'),
  ('Office', 'Оффис', 'briefcase'),
  ('IT', 'Мэдээллийн технологи', 'laptop'),
  ('Education', 'Боловсрол', 'book-open'),
  ('Healthcare', 'Эрүүл мэнд', 'heart-pulse')
ON CONFLICT (name) DO NOTHING;
