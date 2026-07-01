import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, MapPin, Phone, User, Clock, AlertTriangle, Check, X,
  ChevronDown, ChevronUp, Loader2, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { getAllOrders, updateOrderStatus, verifyPayment, rejectPayment, cancelOrder } from '../../services/orders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import type { Order, OrderStatus } from '../../types/database';

// ── Status flow & config ──────────────────────────────────────────────
const STATUS_FLOW: OrderStatus[] = [
  'waiting_verification',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

const STEP_INDEX = Object.fromEntries(STATUS_FLOW.map((s, i) => [s, i] as const)) as Record<OrderStatus, number>;

const STATUS_BUTTONS: {
  key: OrderStatus;
  label: string;
  color: string;
  bg: string;
  hover: string;
  icon: string;
}[] = [
  { key: 'waiting_verification', label: 'Verify Payment',   color: '#2563eb', bg: '#eff6ff', hover: '#dbeafe', icon: '✓' },
  { key: 'accepted',              label: 'Accept Order',     color: '#059669', bg: '#ecfdf5', hover: '#d1fae5', icon: '✓' },
  { key: 'preparing',             label: 'Start Preparing',  color: '#ea580c', bg: '#fff7ed', hover: '#ffedd5', icon: '🍳' },
  { key: 'ready',                 label: 'Mark Ready',       color: '#7c3aed', bg: '#f5f3ff', hover: '#ede9fe', icon: '📦' },
  { key: 'out_for_delivery',      label: 'Out for Delivery', color: '#4f46e5', bg: '#eef2ff', hover: '#e0e7ff', icon: '🚚' },
  { key: 'delivered',             label: 'Mark Delivered',   color: '#10b981', bg: '#ecfdf5', hover: '#d1fae5', icon: '✓' },
];

const CANCELLED_BUTTON = { key: 'cancelled' as OrderStatus, label: 'Cancel Order', color: '#dc2626', bg: '#fef2f2', hover: '#fee2e2', icon: '✕' };

function getOrderStep(order: Order) {
  return STEP_INDEX[order.status as OrderStatus] ?? -1;
}

function isAtOrPast(order: Order, status: OrderStatus) {
  return getOrderStep(order) >= STEP_INDEX[status];
}

function estDelivery(createdAt: string) {
  const d = new Date(createdAt);
  d.setMinutes(d.getMinutes() + 45);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatPhone(phone: string) {
  if (phone.length === 10) return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  return phone;
}

// ── Confirm dialog hook ───────────────────────────────────────────────
function useConfirm() {
  const [state, setState] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const confirm = (message: string, onConfirm: () => void) => setState({ message, onConfirm });
  const dismiss = () => setState(null);
  return { state, confirm, dismiss };
}

// ── Rejection reason hook ─────────────────────────────────────────────
function useRejectReason() {
  const [state, setState] = useState<{ orderId: string } | null>(null);
  const open = (orderId: string) => setState({ orderId });
  const dismiss = () => setState(null);
  return { state, open, dismiss };
}

// ── Page component ────────────────────────────────────────────────────
export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => getAllOrders(statusFilter === 'all' ? undefined : statusFilter),
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-orders', statusFilter] });
      const prev = queryClient.getQueriesData({ queryKey: ['admin-orders'] });
      queryClient.setQueriesData({ queryKey: ['admin-orders'] }, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((o: Record<string, unknown>) => o.id === id ? { ...o, status } : o);
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to update order status');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
    onSuccess: () => toast.success('Order status updated'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => verifyPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Payment verified, order accepted');
    },
    onError: () => toast.error('Failed to verify payment'),
  });

  const rejectWithReasonMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectPayment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Payment rejected, customer notified');
    },
    onError: () => toast.error('Failed to reject payment'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order cancelled');
    },
    onError: () => toast.error('Failed to cancel order'),
  });

  const confirm = useConfirm();
  const rejectBox = useRejectReason();

  const filteredOrders = orders?.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Orders</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage all customer orders, verify payments, and track progress.</p>
      </motion.div>

      {/* Filters */}
      <div style={{padding:'12px',background:'#fef2f2',border:'2px solid red',borderRadius:'12px',marginBottom:'12px',textAlign:'center'}}>
        <strong style={{color:'#dc2626',fontSize:'16px'}}>TEST: Admin buttons should appear below each order card ↓</strong>
        <div style={{marginTop:'8px',display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'center'}}>
          <button style={{padding:'8px 16px',background:'#2563eb',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>✓ Verify Payment</button>
          <button style={{padding:'8px 16px',background:'#059669',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>✓ Accept Order</button>
          <button style={{padding:'8px 16px',background:'#ea580c',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>🍳 Start Preparing</button>
          <button style={{padding:'8px 16px',background:'#7c3aed',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>📦 Mark Ready</button>
          <button style={{padding:'8px 16px',background:'#4f46e5',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>🚚 Out for Delivery</button>
          <button style={{padding:'8px 16px',background:'#10b981',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>✓ Mark Delivered</button>
          <button style={{padding:'8px 16px',background:'#dc2626',color:'white',border:'none',borderRadius:'8px',fontWeight:600,cursor:'pointer'}}>✕ Cancel Order</button>
        </div>
      </div>
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
            <option value="all">All Orders ({orders?.length ?? 0})</option>
            <option value="waiting_verification">Verify Payment ({orders?.filter(o => o.status === 'waiting_verification').length ?? 0})</option>
            <option value="accepted">Accepted ({orders?.filter(o => o.status === 'accepted').length ?? 0})</option>
            <option value="preparing">Preparing ({orders?.filter(o => o.status === 'preparing').length ?? 0})</option>
            <option value="ready">Ready ({orders?.filter(o => o.status === 'ready').length ?? 0})</option>
            <option value="out_for_delivery">Out for Delivery ({orders?.filter(o => o.status === 'out_for_delivery').length ?? 0})</option>
            <option value="delivered">Delivered ({orders?.filter(o => o.status === 'delivered').length ?? 0})</option>
            <option value="cancelled">Cancelled ({orders?.filter(o => o.status === 'cancelled').length ?? 0})</option>
          </select>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="text-amber-600 animate-spin" />
          </div>
        )}
        {!isLoading && (!filteredOrders || filteredOrders.length === 0) && (
          <div className="text-center py-16">
            <p className="text-stone-400">No orders found for this filter.</p>
          </div>
        )}
        {filteredOrders?.map((order, i) => {
          const raw = order as Order & {
            order_items?: { name: string; quantity: number; price: number; is_veg: boolean; image_url: string }[];
            payments?: { id: string; status: string; upi_ref: string | null; amount: number; verified_at: string | null }[];
          };
          const currentStep = getOrderStep(order);
          const isTerminal = ['delivered', 'cancelled'].includes(order.status);
          const isLive = !isTerminal;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden"
            >
              {/* ── Card Header ───────────────────────────────────────── */}
              <div
                className="p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center flex-wrap gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900 dark:text-stone-100">{order.order_number}</p>
                    <p className="text-xs text-stone-400 flex items-center gap-1.5 flex-wrap">
                      <span>{formatDate(order.created_at)}</span>
                      <span className="hidden xs:inline">&bull;</span>
                      <span>{order.customer_name}</span>
                      <span className="hidden xs:inline">&bull;</span>
                      <span>{formatPhone(order.customer_phone)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {raw.payments?.[0] && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        raw.payments[0].status === 'verified' ? 'bg-green-100 text-green-700' :
                        raw.payments[0].status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {raw.payments[0].status === 'verified' ? 'PAID' : raw.payments[0].status === 'failed' ? 'FAILED' : 'PENDING'}
                      </span>
                    )}
                    <span className="font-bold text-stone-900 dark:text-stone-100">₹{order.total_amount}</span>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                </div>
              </div>

              {/* ── BOTTOM BUTTONS (always visible for EVERY order) ── */}
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); verifyMutation.mutate(order.id); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#2563eb',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  ✓ Verify Payment
                </button>
                <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: 'accepted' }); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#059669',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  ✓ Accept Order
                </button>
                <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: 'preparing' }); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#ea580c',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  🍳 Start Preparing
                </button>
                <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: 'ready' }); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#7c3aed',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  📦 Mark Ready
                </button>
                <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: 'out_for_delivery' }); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#4f46e5',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  🚚 Out for Delivery
                </button>
                <button onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: order.id, status: 'delivered' }); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#10b981',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  ✓ Mark Delivered
                </button>
                <button onClick={(e) => { e.stopPropagation(); cancelMutation.mutate(order.id); }} style={{padding:'5px 12px',fontSize:'11px',fontWeight:600,background:'#dc2626',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
                  ✕ Cancel Order
                </button>
              </div>

              {/* ── Expanded details ──────────────────────────────────── */}
              {expandedOrder === order.id && (
                <div className="border-t border-stone-100 dark:border-stone-800">
                  <div className="p-4 space-y-4">

                    {/* Payment Verification Section */}
                    {raw.payments?.[0] && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">Payment Details</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            raw.payments[0].status === 'verified' ? 'bg-green-100 text-green-700' :
                            raw.payments[0].status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {raw.payments[0].status === 'verified' ? 'Verified' :
                             raw.payments[0].status === 'failed' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-blue-500">Amount</p>
                            <p className="font-semibold text-blue-900 dark:text-blue-100">₹{raw.payments[0].amount}</p>
                          </div>
                          {raw.payments[0].upi_ref && (
                            <div>
                              <p className="text-xs text-blue-500">UPI Ref</p>
                              <p className="font-mono text-xs text-blue-900 dark:text-blue-100 break-all">{raw.payments[0].upi_ref}</p>
                            </div>
                          )}
                          {raw.payments[0].verified_at && (
                            <div>
                              <p className="text-xs text-blue-500">Verified At</p>
                              <p className="font-semibold text-blue-900 dark:text-blue-100">{formatDate(raw.payments[0].verified_at)}</p>
                            </div>
                          )}
                        </div>
                        {/* Approve / Reject buttons for pending payments */}
                        {raw.payments[0].status === 'processing' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); verifyMutation.mutate(order.id); }}
                              disabled={verifyMutation.isPending}
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              {verifyMutation.isPending ? '...' : '✓ Approve Payment'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); rejectBox.open(order.id); }}
                              disabled={rejectWithReasonMutation.isPending}
                              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              {rejectWithReasonMutation.isPending ? '...' : '✕ Reject Payment'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                        <p className="text-xs text-stone-400 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1"><User size={12} /> Customer</p>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">{order.customer_name}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1 mt-0.5"><Phone size={11} /> {formatPhone(order.customer_phone)}</p>
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                        <p className="text-xs text-stone-400 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1"><MapPin size={12} /> Delivery Address</p>
                        <p className="text-sm text-stone-700 dark:text-stone-300">{order.delivery_address}</p>
                        {order.delivery_landmark && <p className="text-xs text-stone-400 mt-0.5">Near: {order.delivery_landmark}</p>}
                        {order.delivery_instructions && <p className="text-xs text-amber-600 mt-0.5">Note: {order.delivery_instructions}</p>}
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3">
                        <p className="text-xs text-stone-400 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1"><Clock size={12} /> Timing</p>
                        <p className="text-sm text-stone-700 dark:text-stone-300">Ordered: {formatDate(order.created_at)}</p>
                        <p className="text-sm text-stone-700 dark:text-stone-300">Est. Delivery: {estDelivery(order.created_at)}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {raw.order_items && raw.order_items.length > 0 && (
                      <div>
                        <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold">Items ({raw.order_items.length})</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {raw.order_items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                                {item.quantity}x
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                                <p className="text-xs text-stone-400">₹{item.price * item.quantity}</p>
                              </div>
                              <span className={`w-3.5 h-3.5 rounded-sm border-2 shrink-0 ${item.is_veg ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600'}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-stone-500">Subtotal: <strong className="text-stone-900 dark:text-stone-100">₹{order.subtotal}</strong></span>
                      <span className="text-stone-500">Delivery: <strong className="text-stone-900 dark:text-stone-100">₹{order.delivery_fee}</strong></span>
                      {order.gst_amount > 0 && <span className="text-stone-500">GST: <strong className="text-stone-900 dark:text-stone-100">₹{order.gst_amount}</strong></span>}
                      {order.discount_amount > 0 && <span className="text-green-600">Discount: <strong>-₹{order.discount_amount}</strong></span>}
                      {order.offer_code && <span className="text-amber-600">Coupon: <strong>{order.offer_code}</strong></span>}
                      <span className="text-stone-900 dark:text-stone-100 font-bold">Total: <strong>₹{order.total_amount}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Confirm Dialog ──────────────────────────────────────────── */}
      <Modal isOpen={!!confirm.state} onClose={confirm.dismiss} size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-amber-600" />
          </div>
          <p className="text-stone-900 dark:text-stone-100 font-semibold mb-5">{confirm.state?.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { confirm.state?.onConfirm(); confirm.dismiss(); }}
              className="px-5 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={confirm.dismiss}
              className="px-5 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-semibold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Rejection Reason Dialog ─────────────────────────────────── */}
      <RejectReasonModal
        isOpen={!!rejectBox.state}
        orderId={rejectBox.state?.orderId ?? ''}
        onClose={rejectBox.dismiss}
        onReject={(id, reason) => {
          rejectWithReasonMutation.mutate({ id, reason });
          rejectBox.dismiss();
        }}
        isLoading={rejectWithReasonMutation.isPending}
      />
    </div>
  );
}

// ── Rejection reason modal ────────────────────────────────────────────
function RejectReasonModal({ isOpen, orderId, onClose, onReject, isLoading }: {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onReject: (id: string, reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div>
        <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-2">Reject Payment</h3>
        <p className="text-sm text-stone-500 mb-3">Provide a reason for rejecting this payment. The customer will be notified.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Invalid UPI transaction, amount mismatch..."
          rows={3}
          className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors bg-white dark:bg-stone-900 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onReject(orderId, reason)}
            disabled={isLoading}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: isLoading ? '#fca5a5' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', flex: 1 }}
          >
            {isLoading ? 'Rejecting...' : 'Reject Payment'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
