import { supabase } from '../lib/supabase';

export async function getNotifications(userId?: string) {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAllNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createAdminNotification(
  title: string,
  message: string,
  type: string,
  orderId?: string | null,
) {
  const { data: admins, error: adminError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('role', 'admin');

  if (adminError) throw adminError;
  if (!admins || admins.length === 0) return;

  const notifications = admins.map(a => ({
    user_id: a.user_id,
    title,
    message,
    type,
    order_id: orderId ?? null,
  }));

  const { error } = await supabase.from('notifications').insert(notifications);
  if (error) throw error;
}

export async function markAsRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw error;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
}

export async function getUnreadCount(userId?: string) {
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}
