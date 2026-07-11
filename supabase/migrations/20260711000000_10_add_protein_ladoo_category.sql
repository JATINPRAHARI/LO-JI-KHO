-- Create dedicated Protein Ladoo category and move PROTEIN LADO from Specials

-- Insert new Protein Ladoo category (sort_order 6, after Specials at 5)
INSERT INTO categories (name, slug, image_url, sort_order, is_active)
SELECT 'Protein Ladoo', 'protein-ladoo', 'https://images.pexels.com/photos/5946507/pexels-photo-5946507.jpeg?auto=compress&cs=tinysrgb&w=600', 6, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'protein-ladoo');

-- Move PROTEIN LADO from Specials to Protein Ladoo
UPDATE menu_items
SET category_id = (SELECT id FROM categories WHERE slug = 'protein-ladoo')
WHERE name = 'PROTEIN LADO'
  AND category_id = (SELECT id FROM categories WHERE slug = 'specials');

-- Deactivate Specials category if it has no remaining items
UPDATE categories
SET is_active = false
WHERE slug = 'specials'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE category_id = categories.id AND is_active = true);
