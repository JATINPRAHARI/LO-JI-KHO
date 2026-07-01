import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type OfferInsert = Database['public']['Tables']['offers']['Insert'];
type OfferUpdate = Database['public']['Tables']['offers']['Update'];

export async function getActiveOffers() {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllOffers() {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function validateCoupon(code: string, subtotal: number) {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Invalid coupon code.');

  if (data.valid_until && new Date(data.valid_until) < new Date()) {
    throw new Error('This coupon has expired.');
  }

  if (subtotal < data.min_order) {
    throw new Error(`Minimum order of ₹${data.min_order} required for this coupon.`);
  }

  let discount = 0;
  if (data.discount_type === 'percentage') {
    discount = (subtotal * data.discount_value) / 100;
    if (data.max_discount) discount = Math.min(discount, data.max_discount);
  } else {
    discount = data.discount_value;
  }

  return { offer: data, discount: Math.round(discount) };
}

export async function createOffer(offer: OfferInsert) {
  const { data, error } = await supabase
    .from('offers')
    .insert({ ...offer, code: offer.code.toUpperCase() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOffer(id: string, updates: OfferUpdate) {
  const { data, error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOffer(id: string) {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw error;
}
