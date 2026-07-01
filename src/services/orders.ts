import { supabase } from '../lib/supabase';
import type { OrderStatus } from '../types/database';

export interface CreateOrderPayload {
  user_id?: string | null;
  subtotal: number;
  delivery_fee: number;
  gst_amount: number;
  discount_amount: number;
  total_amount: number;
  offer_code?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_landmark?: string;
  delivery_instructions?: string;
  items: {
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    is_veg: boolean;
  }[];
}

export async function createOrder(payload: CreateOrderPayload, initialStatus: OrderStatus = 'payment_pending') {
  const { items, ...orderData } = payload;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ ...orderData, user_id: orderData.user_id ?? null, status: initialStatus })
    .select()
    .single();
  if (orderError) throw orderError;

  const orderItems = items.map(item => ({ ...item, order_id: order.id }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Only insert notification if user_id exists (logged-in users)
  if (order.user_id) {
    await supabase.from('notifications').insert({
      user_id: order.user_id,
      title: initialStatus === 'waiting_verification' ? 'Payment Submitted' : 'Order Placed!',
      message: initialStatus === 'waiting_verification'
        ? `Your payment for order ${order.order_number} is under verification. We'll confirm shortly!`
        : `Your order ${order.order_number} has been placed. Awaiting payment verification.`,
      type: initialStatus === 'waiting_verification' ? 'payment_pending' : 'order_received',
      order_id: order.id,
    });
  }

  return order;
}

/** Create order + payment record in one go (used when customer clicks "I've Paid") */
export async function createOrderWithPayment(payload: CreateOrderPayload) {
  // Create order with waiting_verification status
  const order = await createOrder(payload, 'waiting_verification');

  // Create payment record with processing status
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      user_id: payload.user_id ?? null,
      amount: payload.total_amount,
      status: 'processing',
    });
  if (paymentError) throw paymentError;

  return order;
}

export async function getMyOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitPayment(orderId: string, amount: number, upiRef?: string) {
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({ order_id: orderId, amount, status: 'processing', upi_ref: upiRef })
    .select()
    .single();
  if (paymentError) throw paymentError;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({ status: 'waiting_verification' })
    .eq('id', orderId)
    .select()
    .single();
  if (orderError) throw orderError;

  await supabase.from('notifications').insert({
    user_id: order.user_id,
    title: 'Payment Submitted',
    message: `Payment for order ${order.order_number} is under verification. We'll confirm shortly!`,
    type: 'payment_pending',
    order_id: orderId,
  });

  return payment;
}

// Admin functions
export async function getAllOrders(status?: OrderStatus) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { data: order, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;

  const statusMessages: Record<OrderStatus, { title: string; message: string; type: string }> = {
    payment_pending: { title: 'Payment Pending', message: 'Please complete your payment.', type: 'payment_pending' },
    waiting_verification: { title: 'Verifying Payment', message: 'Your payment is being verified.', type: 'payment_pending' },
    accepted: { title: 'Order Accepted!', message: `Order ${order.order_number} has been accepted. Kitchen is preparing your food.`, type: 'accepted' },
    preparing: { title: 'Preparing Your Food', message: `Your artisanal food is being crafted with love.`, type: 'preparing' },
    ready: { title: 'Order Ready!', message: `Your order ${order.order_number} is packed and ready for pickup.`, type: 'ready' },
    out_for_delivery: { title: 'Out for Delivery!', message: `Your order ${order.order_number} is on the way. Estimated 20-30 mins.`, type: 'out_for_delivery' },
    delivered: { title: 'Order Delivered!', message: `Your order ${order.order_number} has been delivered. Enjoy your meal!`, type: 'delivered' },
    cancelled: { title: 'Order Cancelled', message: `Your order ${order.order_number} has been cancelled. If payment was made, refund will be processed.`, type: 'cancelled' },
  };

  const notif = statusMessages[status];
  if (notif) {
    await supabase.from('notifications').insert({
      user_id: order.user_id,
      title: notif.title,
      message: notif.message,
      type: notif.type as never,
      order_id: orderId,
    });
  }

  return order;
}

export async function verifyPayment(orderId: string) {
  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('order_id', orderId);
  if (paymentError) throw paymentError;

  return updateOrderStatus(orderId, 'accepted');
}

export async function cancelOrder(orderId: string) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .single();
  if (orderError) throw orderError;

  await supabase.from('notifications').insert({
    user_id: order.user_id,
    title: 'Order Cancelled',
    message: `Your order ${order.order_number} has been cancelled. If payment was made, refund will be processed within 3-5 business days.`,
    type: 'cancelled',
    order_id: orderId,
  });

  return order;
}

export async function rejectPayment(orderId: string) {
  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('order_id', orderId);
  if (paymentError) throw paymentError;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({ status: 'payment_pending' })
    .eq('id', orderId)
    .select()
    .single();
  if (orderError) throw orderError;

  await supabase.from('notifications').insert({
    user_id: order.user_id,
    title: 'Payment Rejected',
    message: `Your payment for order ${order.order_number} was not verified. Please try again with a valid UPI transaction.`,
    type: 'payment_pending',
    order_id: orderId,
  });

  return order;
}

export async function getTodayStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount')
    .gte('created_at', today.toISOString());
  if (error) throw error;

  const orders = data ?? [];
  return {
    total: orders.length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total_amount, 0),
    pending: orders.filter(o => ['waiting_verification', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };
}
