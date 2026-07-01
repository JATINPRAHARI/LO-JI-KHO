import { supabase } from '../lib/supabase';

export interface ReviewData {
  order_id: string;
  user_id?: string | null;
  rating: number;
  comment: string;
}

export async function submitReview(data: ReviewData) {
  const { error } = await supabase
    .from('reviews')
    .insert({
      order_id: data.order_id,
      user_id: data.user_id ?? null,
      rating: data.rating,
      comment: data.comment,
    });
  if (error) throw error;
}

export async function getReviewForOrder(orderId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
