import { supabase } from '../lib/supabase';

export async function getCartItems() {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, menu_items(id, name, price, image_url, is_veg, is_active, category_id)')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addToCart(userId: string, menuItemId: string, quantity = 1) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ user_id: userId, menu_item_id: menuItemId, quantity }, { onConflict: 'user_id,menu_item_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCartQuantity(userId: string, menuItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(userId, menuItemId);
  }
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('menu_item_id', menuItemId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromCart(userId: string, menuItemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('menu_item_id', menuItemId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}
