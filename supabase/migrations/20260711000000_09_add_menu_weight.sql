-- Add weight column to menu_items for displaying portion/serving size
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS weight text DEFAULT '';
