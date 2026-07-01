import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Check, X, ChevronDown, ChevronUp, MapPin, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAllOrders, updateOrderStatus, verifyPayment, rejectPayment } from '../../services/orders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';
import type { Order, OrderStatus } from '../../types/database';
import { usePageTitle } from '../../../hooks/usePageTitle';

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Orders', color: 'bg-stone-100 text-stone-700' },
  { value: 'waiting_verification', label: 'Verify Payment', color: 'bg-blue-100 text-blue-700' },
  { value: 'payment_pending', label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'accepted', label: 'Accepted', color: 'bg-amber-100 text-amber-700' },
  { value: 'preparing', label: 'Preparing', color: 'bg-orange-100 text-orange-700' },
  { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-700' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => getAllOrders(statusFilter === 'all' ? undefined : statusFilter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update order'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => verifyPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Payment verified, order accepted');
    },
    onError: () => toast.error('Failed to verify payment'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Payment rejected, customer notified');
    },
    onError: () => toast.error('Failed to reject payment'),
  });

  const filteredOrders = orders?.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Orders</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage and track all customer orders.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, name, or phone..."
            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-stone-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
          >
            {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label} {f.value !== 'all' ? `(${orders?.filter(o => o.status === f.value).length ?? 0})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-stone-400 text-center py-10">Loading orders...</p>}
        {!isLoading && (!filteredOrders || filteredOrders.length === 0) && (
          <div className="text-center py-10">
            <p className="text-stone-400">No orders found.</p>
          </div>
        )}
        {filteredOrders?.map((order, i) => {
          const orderWithItems = order as Order & {
            order_items?: { name: string; quantity: number; price: number; is_veg: boolean; image_url: string }[];
            payments?: { status: string; upi_ref: string | null }[];
            profiles?: { name: string; phone: string };
          };

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p>
                      <p className="text-xs text-stone-400">{formatDate(order.created_at)} &bull; {order.customer_name} &bull; {order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Payment Status Badge */}
                    {orderWithItems.payments?.[0] && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        orderWithItems.payments[0].status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        orderWithItems.payments[0].status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {orderWithItems.payments[0].status === 'verified' ? 'PAID' : orderWithItems.payments[0].status === 'failed' ? 'FAILED' : 'PENDING'}
                      </span>
                    )}
                    <span className="font-bold text-stone-900 dark:text-stone-100">&#x20B9;{order.total_amount}</span>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <div className="p-4 space-y-4">
                      {/* Customer & Address */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold flex items-center gap-1"><User size={12} /> Customer</p>
                          <p className="font-semibold text-stone-900 dark:text-stone-100">{order.customer_name}</p>
                          <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1 mt-0.5"><Phone size={11} /> {order.customer_phone}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold flex items-center gap-1"><MapPin size={12} /> Delivery Address</p>
                          <p className="text-sm text-stone-700 dark:text-stone-300">{order.delivery_address}</p>
                          {order.delivery_landmark && <p className="text-xs text-stone-400 mt-1">Near: {order.delivery_landmark}</p>}
                          {order.delivery_instructions && <p className="text-xs text-amber-600 mt-1">Note: {order.delivery_instructions}</p>}
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold">Payment</p>
                          {orderWithItems.payments?.[0] ? (
                            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                              orderWithItems.payments[0].status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              orderWithItems.payments[0].status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {orderWithItems.payments[0].status === 'verified' ? 'Verified' :
                               orderWithItems.payments[0].status === 'failed' ? 'Failed' : 'Pending'}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400">No payment yet</span>
                          )}
                          <div className="mt-2 space-y-0.5">
                            <p className="text-sm text-stone-700 dark:text-stone-300">Subtotal: &#x20B9;{order.subtotal}</p>
                            <p className="text-sm text-stone-700 dark:text-stone-300">Delivery: &#x20B9;{order.delivery_fee}</p>
                            {order.discount_amount > 0 && <p className="text-sm text-green-600">-Discount: &#x20B9;{order.discount_amount}</p>}
                            <p className="font-bold text-stone-900 dark:text-stone-100 mt-1">Total: &#x20B9;{order.total_amount}</p>
                            {order.offer_code && <p className="text-xs text-amber-600">Coupon: {order.offer_code}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      {orderWithItems.order_items && orderWithItems.order_items.length > 0 && (
                        <div>
                          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Order Items ({orderWithItems.order_items.length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {orderWithItems.order_items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-800 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shrink-0">
                                  <span className="text-white text-xs font-bold">{item.quantity}x</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                                  <p className="text-xs text-stone-400">&#x20B9;{item.price * item.quantity}</p>
                                </div>
                                <span className={`w-4 h-4 rounded border-2 ${item.is_veg ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600'}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                        {order.status === 'waiting_verification' && (
                          <>
                            <Button
                              size="sm"
                              leftIcon={<Check size={14} />}
                              onClick={() => verifyMutation.mutate(order.id)}
                              isLoading={verifyMutation.isPending}
                            >
                              Verify Payment
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<X size={14} />}
                              onClick={() => rejectMutation.mutate(order.id)}
                              isLoading={rejectMutation.isPending}
                            >
                              Reject Payment
                            </Button>
                          </>
                        )}
                        {order.status === 'payment_pending' && (
                          <Button
                            size="sm"
                            leftIcon={<Check size={14} />}
                            onClick={() => verifyMutation.mutate(order.id)}
                            isLoading={verifyMutation.isPending}
                          >
                            Skip &amp; Accept Order
                          </Button>
                        )}
                        {order.status === 'accepted' && (
                          <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: 'preparing' })} isLoading={statusMutation.isPending}>
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: 'ready' })} isLoading={statusMutation.isPending}>
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: 'out_for_delivery' })} isLoading={statusMutation.isPending}>
                            Out for Delivery
                          </Button>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <Button size="sm" variant="success" onClick={() => statusMutation.mutate({ id: order.id, status: 'delivered' })} isLoading={statusMutation.isPending}>
                            Mark Delivered
                          </Button>
                        )}
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<X size={14} />}
                            onClick={() => statusMutation.mutate({ id: order.id, status: 'cancelled' })}
                            isLoading={statusMutation.isPending}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
