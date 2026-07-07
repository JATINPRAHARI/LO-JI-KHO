/*
# Step 7: Fix orders RLS to prevent users from seeing other users' orders

Authenticated users can only see their own orders (or all if admin).
Anonymous users can only see guest orders (user_id IS NULL).
*/

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
TO authenticated, anon
USING (
  CASE
    WHEN auth.role() = 'authenticated' THEN (auth.uid() = user_id OR is_admin())
    ELSE user_id IS NULL
  END
);
