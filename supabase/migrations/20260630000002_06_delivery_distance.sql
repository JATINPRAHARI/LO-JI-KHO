ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance numeric(5,1) DEFAULT NULL;
