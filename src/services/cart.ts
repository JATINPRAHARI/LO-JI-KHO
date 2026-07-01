import { supabase } from '../lib/supabase';

export async function getCartItems() {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, menu_items(id, name, price, image_url, is_veg, is_active, category_id)')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addToCart(menuItemId: string, quantity = 1) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({ menu_item_id: menuItemId, quantity }, { onConflict: 'user_id,menu_item_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCartQuantity(menuItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(menuItemId);
  }
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('menu_item_id', menuItemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromCart(menuItemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('menu_item_id', menuItemId);
  if (error) throw error;
}

export async function clearCart() {
  const { error } = await supabase.from('cart_items').delete().neq('id', '');
  if (error) throw error;
}
