import { supabase } from '../lib/supabase';

export async function getFavorites() {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, menu_items(*, categories(name, slug))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addFavorite(menuItemId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ menu_item_id: menuItemId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFavorite(menuItemId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('menu_item_id', menuItemId);
  if (error) throw error;
}

export async function getFavoriteIds() {
  const { data, error } = await supabase
    .from('favorites')
    .select('menu_item_id');
  if (error) throw error;
  return (data ?? []).map(f => f.menu_item_id);
}
