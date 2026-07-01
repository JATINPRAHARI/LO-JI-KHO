import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

export async function getAddresses() {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAddress(address: Omit<AddressInsert, 'user_id'>) {
  const { data, error } = await supabase
    .from('addresses')
    .insert(address)
    .select()
    .single();
  if (error) throw error;

  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .neq('id', data.id);
  }
  return data;
}

export async function updateAddress(id: string, updates: AddressUpdate) {
  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  if (updates.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .neq('id', id);
  }
  return data;
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function setDefaultAddress(id: string) {
  await supabase.from('addresses').update({ is_default: false }).neq('id', '');
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
