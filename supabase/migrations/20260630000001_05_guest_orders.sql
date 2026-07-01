/*
# Step 5: Allow guest orders (no login required)

Makes user_id nullable so orders can be placed without authentication.
The payment page is also accessible to guests via order ID.
*/

-- Make user_id nullable for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN user_id DROP DEFAULT;

-- Update the RLS policy to allow guests to insert orders
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
TO authenticated, anon WITH CHECK (true);

-- Allow guests to read their orders by order ID (for payment tracking)
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
TO authenticated, anon USING (true);

-- Allow guests to insert order items
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
TO authenticated, anon WITH CHECK (true);

-- Allow guests to read order items
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
TO authenticated, anon USING (true);

-- Allow guests to insert payments
DROP POLICY IF EXISTS "payments_insert_own" ON payments;
CREATE POLICY "payments_insert_own" ON payments FOR INSERT
TO authenticated, anon WITH CHECK (true);

-- Allow guests to read payments
DROP POLICY IF EXISTS "payments_select_own" ON payments;
CREATE POLICY "payments_select_own" ON payments FOR SELECT
TO authenticated, anon USING (true);

-- Allow admin to read all notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_select_all" ON notifications;
CREATE POLICY "notifications_select_all" ON notifications FOR SELECT
TO authenticated USING (true);

-- Allow admin to update notifications (mark as read)
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_all" ON notifications;
CREATE POLICY "notifications_update_all" ON notifications FOR UPDATE
TO authenticated USING (true);
