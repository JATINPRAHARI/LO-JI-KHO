import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getMenuItems(categorySlug?: string, search?: string) {
  let query = supabase
    .from('menu_items')
    .select('*, categories!inner(name, slug)')
    .eq('is_active', true)
    .order('sort_order');

  if (categorySlug && categorySlug !== 'all') {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, categories!inner(name, slug)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order')
    .limit(6);
  if (error) throw error;
  return data ?? [];
}

export async function getAllMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, categories!inner(name, slug)')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getMenuItemById(id: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, categories!inner(name, slug)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createMenuItem(item: MenuItemInsert) {
  const { data, error } = await supabase.from('menu_items').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateMenuItem(id: string, updates: MenuItemUpdate) {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleMenuItemActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCategory(cat: CategoryInsert) {
  const { data, error } = await supabase.from('categories').insert(cat).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: { name?: string; is_active?: boolean; sort_order?: number }) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
