-- Ensure weight column exists (added by migration 09)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS weight text DEFAULT '';

-- Remove burgers
DELETE FROM menu_items WHERE category_id IN (SELECT id FROM categories WHERE slug = 'burger');
DELETE FROM categories WHERE slug = 'burger';

-- Seed categories
INSERT INTO categories (name, slug, image_url, sort_order) VALUES
  ('Maggi', 'maggi', 'https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
  ('Sandwiches', 'sandwiches', 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=600', 2),
  ('Pasta', 'pasta', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600', 3),
  ('Cold Coffee', 'cold-coffee', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600', 4)
ON CONFLICT (slug) DO NOTHING;

-- Seed menu items (Maggi)
WITH cat AS (SELECT id FROM categories WHERE slug = 'maggi')
INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, sort_order) 
SELECT cat.id, 'Double Masala Maggi', 'Double masala, double mazaa.', 59, 'https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=400', true, 1 FROM cat
UNION ALL
SELECT cat.id, 'Veg Loaded Maggi', 'Loaded with veggies & masala.', 69, 'https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=400', true, 2 FROM cat
UNION ALL
SELECT cat.id, 'Cheese Loaded Maggi', 'Cheesy & delicious.', 79, 'https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=400', true, 3 FROM cat;

-- Seed menu items (Sandwiches)
WITH cat AS (SELECT id FROM categories WHERE slug = 'sandwiches')
INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, sort_order)
SELECT cat.id, 'Crispy Veg Grilled Sandwich', 'Crispy, crunchy & loaded with veggies.', 79, 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=400', true, 1 FROM cat
UNION ALL
SELECT cat.id, 'Smoky Tandoori Grilled Sandwich', 'Smoky tandoori filling with a grilled twist.', 89, 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=400', true, 2 FROM cat
UNION ALL
SELECT cat.id, 'Extra Cheese Melt Sandwich', 'Extra cheesy & perfectly grilled.', 99, 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=400', true, 3 FROM cat;

-- Seed menu items (Pasta)
WITH cat AS (SELECT id FROM categories WHERE slug = 'pasta')
INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, sort_order)
SELECT cat.id, 'Creamy Onion & Corn White Sauce Pasta', 'Creamy, yummy & wholesome.', 119, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400', true, 1 FROM cat
UNION ALL
SELECT cat.id, 'Onion & Capsicum White Sauce Pasta', 'Light, creamy & full of flavour.', 119, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400', true, 2 FROM cat
UNION ALL
SELECT cat.id, 'Veg Loaded White Sauce Pasta', 'Loaded with veggies & cheesy sauce.', 129, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400', true, 3 FROM cat
UNION ALL
SELECT cat.id, 'Extra Creamy Cheese White Sauce Pasta', 'Extra creamy & super cheesy.', 149, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400', true, 4 FROM cat;

-- Seed menu items (Cold Coffee)
WITH cat AS (SELECT id FROM categories WHERE slug = 'cold-coffee')
INSERT INTO menu_items (category_id, name, description, price, image_url, is_veg, sort_order)
SELECT cat.id, 'Thick & Creamy Cold Coffee', 'Rich, creamy & refreshing.', 69, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400', true, 1 FROM cat
UNION ALL
SELECT cat.id, 'Chocolate Cold Coffee', 'Smooth chocolatey goodness.', 79, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400', true, 2 FROM cat;

-- Seed Protein Ladoo category
INSERT INTO categories (name, slug, image_url, sort_order) VALUES
  ('Protein Ladoo', 'protein-ladoo', 'https://images.pexels.com/photos/5946507/pexels-photo-5946507.jpeg?auto=compress&cs=tinysrgb&w=600', 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed PROTEIN LADO
WITH cat AS (SELECT id FROM categories WHERE slug = 'protein-ladoo')
INSERT INTO menu_items (category_id, name, description, price, weight, image_url, is_veg, is_best_seller, sort_order)
SELECT cat.id, 'PROTEIN LADO', 'High-protein traditional Indian sweet. Packed with goodness.', 249, '250GM', 'https://images.pexels.com/photos/5946507/pexels-photo-5946507.jpeg?auto=compress&cs=tinysrgb&w=400', true, true, 1 FROM cat;
