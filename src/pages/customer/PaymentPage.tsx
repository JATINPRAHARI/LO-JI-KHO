import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Copy, CheckCircle2, Loader2, ArrowLeft, Instagram, ChefHat, XCircle, Clock, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { getOrderById, createOrderWithPayment, submitPayment, cancelOrder } from '../../services/orders';
import { submitReview, getReviewForOrder } from '../../services/reviews';
import { getAllSettings } from '../../services/settings';
import { Button } from '../../components/ui/Button';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { iconForItem } from '../../utils/iconForItem';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Order } from '../../types/database';

const ORDER_STEPS = [
  { key: 'payment_pending', label: 'Order Placed', desc: "We've received your order." },
  { key: 'waiting_verification', label: 'Payment Verification', desc: 'Confirming transaction with your bank...' },
  { key: 'accepted', label: 'Order Accepted', desc: 'Our chefs are preparing to cook.' },
  { key: 'preparing', label: 'Preparing', desc: 'Crafting your artisanal comfort food.' },
  { key: 'ready', label: 'Ready', desc: 'Packed and ready for dispatch.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Our delivery partner is on the way.' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your Lo Ji Khao experience!' },
];

const STATUS_ORDER = ['payment_pending', 'waiting_verification', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

function getStepIndex(status: string) {
  return STATUS_ORDER.indexOf(status);
}

interface PendingOrderData {
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

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [liveOrder, setLiveOrder] = useState<Order | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch existing review for delivered orders
  const { data: existingReview } = useQuery({
    queryKey: ['review', orderId],
    queryFn: () => getReviewForOrder(orderId!),
    enabled: !!orderId && (trackOrder?.status === 'delivered'),
  });

  // Determine if we're in "create order" mode (no orderId) or "track order" mode
  const isCreateMode = !orderId;

  // Fetch existing order (track mode)
  const { data: existingOrder, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
  });

  // Fetch settings for QR
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getAllSettings });
  const upiId = '7906039087@kotak';
  const defaultQrImage = "/images/WhatsApp Image 2026-06-30 at 2.07.38 PM.jpeg";
  const upiQrUrl = settings?.upi_qr_url || defaultQrImage;

  // Get pending order from sessionStorage (create mode)
  const [pendingOrder, setPendingOrder] = useState<PendingOrderData | null>(null);

  useEffect(() => {
    if (isCreateMode) {
      const stored = sessionStorage.getItem('pendingOrder');
      if (stored) {
        try {
          setPendingOrder(JSON.parse(stored));
        } catch {
          setPendingOrder(null);
        }
      }
    }
  }, [isCreateMode]);

  // The order we're tracking (existing or newly created)
  const trackOrder = liveOrder ?? existingOrder;
  const currentOrder = isCreateMode ? (createdOrderId ? trackOrder : null) : trackOrder;
  const currentStatus = currentOrder?.status ?? 'payment_pending';
  const currentStepIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  // Order summary for create mode
  const orderSummary = pendingOrder;

  // Realtime subscription for tracking
  useEffect(() => {
    const id = createdOrderId ?? orderId;
    if (!id) return;
    const channel = supabase
      .channel(`order:${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`,
      }, payload => {
        setLiveOrder(payload.new as Order);
        queryClient.setQueryData(['order', id], (old: unknown) =>
          old ? { ...(old as object), ...payload.new } : payload.new
        );
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [createdOrderId, orderId, queryClient]);

  async function handleCopyUpi() {
    await navigator.clipboard.writeText(upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // MODE 1: Create order when user clicks "I've Paid"
  async function handleIPaidCreate() {
    if (!pendingOrder) {
      toast.error('Order data not found. Please go back and try again.');
      return;
    }
    setProcessing(true);
    try {
      const order = await createOrderWithPayment(pendingOrder);
      setCreatedOrderId(order.id);
      sessionStorage.removeItem('pendingOrder');
      toast.success('Payment submitted! Awaiting verification.');
    } catch (err) {
      console.error('Failed to create order:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit payment. Please try again.';
      toast.error(message);
      setProcessing(false);
    }
  }

  // MODE 2: Update existing order status
  async function handleIPaidUpdate() {
    if (!orderId || !currentOrder) return;
    setPaid(true);
    try {
      await submitPayment(orderId, currentOrder.total_amount);
      toast.success('Payment submitted! Awaiting verification.');
    } catch {
      toast.error('Failed to submit payment. Please try again.');
      setPaid(false);
    }
  }

  async function handleCancelOrder() {
    if (!currentOrder) return;
    setCancelling(true);
    try {
      await cancelOrder(currentOrder.id, true);
      toast.success('Order cancelled.');
      navigate('/');
    } catch {
      toast.error('Failed to cancel order. Please try again.');
      setCancelling(false);
    }
  }

  async function handleSubmitReview() {
    if (!currentOrder || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        order_id: currentOrder.id,
        user_id: currentOrder.user_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Thank you for your review!');
      queryClient.invalidateQueries({ queryKey: ['review', orderId] });
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
    setSubmittingReview(false);
  }

  // Loading state
  if (orderLoading && !isCreateMode) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-brand-bg dark:bg-stone-950">
      <Loader2 size={32} className="text-brand-primary animate-spin" />
    </div>
  );

  // No pending order in create mode
  if (isCreateMode && !pendingOrder && !createdOrderId) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-brand-bg dark:bg-stone-950">
      <div className="text-center">
        <p className="text-stone-500 mb-4">No pending order found.</p>
        <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
      </div>
    </div>
  );

  // No existing order found in track mode
  if (!isCreateMode && !currentOrder && !orderLoading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-brand-bg dark:bg-stone-950">
      <div className="text-center">
        <p className="text-stone-500 mb-4">Order not found.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    </div>
  );

  // Determine which handler to use
  const handleIPaid = isCreateMode ? handleIPaidCreate : handleIPaidUpdate;
  const isProcessingPayment = isCreateMode ? processing : paid;

  // Order number for display
  const displayOrderNumber = currentOrder?.order_number ?? 'Pending';
  const displayAmount = currentOrder?.total_amount ?? orderSummary?.total_amount ?? 0;

  return (
    <div className="pt-20 min-h-screen bg-brand-bg dark:bg-stone-950 pb-10">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-brand-primary dark:hover:text-brand-accent mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Panel */}
          <AnimatePresence mode="wait">
            {currentStatus === 'payment_pending' && !isProcessingPayment && (
              <motion.div
                key="payment-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={20} className="text-brand-primary" />
                  <h2 className="font-playfair text-2xl font-bold text-stone-900 dark:text-stone-100">Secure UPI Payment</h2>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-brand-primary/20 dark:border-stone-800 overflow-hidden">
                  {/* Order Header */}
                  <div className="flex items-start justify-between p-5 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-r from-brand-bg to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Order ID</p>
                      <p className="font-playfair font-bold text-brand-primary dark:text-brand-accent text-xl">{displayOrderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Total Amount</p>
                      <p className="font-playfair font-bold text-stone-900 dark:text-stone-100 text-xl">&#x20B9;{displayAmount}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* QR Code */}
                    <div className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl p-4 flex items-center justify-center bg-stone-50 dark:bg-stone-800">
                      {upiQrUrl ? (
                        <img src={upiQrUrl} alt="UPI QR Code" className="w-48 h-48 object-contain rounded-xl" />
                      ) : (
                        <div className="w-48 h-48 bg-white dark:bg-stone-900 rounded-xl flex flex-col items-center justify-center gap-3 shadow-inner border border-stone-200 dark:border-stone-700">
                          <div className="grid grid-cols-7 gap-1">
                            {[
                              1,1,1,0,1,1,1,
                              1,0,1,0,1,0,1,
                              1,1,1,0,1,1,1,
                              0,0,0,1,0,0,0,
                              1,1,1,0,1,1,1,
                              1,0,1,0,0,0,1,
                              1,1,1,0,1,1,1,
                            ].map((cell, i) => (
                              <div key={i} className={`w-4 h-4 rounded-[2px] ${cell ? 'bg-stone-900 dark:bg-white' : 'bg-transparent'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-stone-400 text-center">Scan to pay via UPI</p>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm text-stone-500 dark:text-stone-400">Scan the QR code with any UPI app</p>

                    {/* UPI ID */}
                    <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wide">UPI ID</p>
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 font-mono">{upiId}</span>
                      </div>
                      <button onClick={handleCopyUpi} className="text-stone-400 hover:text-brand-primary transition-colors p-1">
                        {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <p className="text-center text-xs text-stone-400">
                      Send exactly <strong className="text-stone-600 dark:text-stone-300">&#x20B9;{displayAmount}</strong> and include order number <strong className="text-stone-600 dark:text-stone-300">{displayOrderNumber}</strong> in remarks.
                    </p>

                    {/* Action Buttons */}
                    <Button
                      onClick={handleIPaid}
                      isLoading={isProcessingPayment}
                      disabled={isProcessingPayment}
                      size="lg"
                      className="w-full"
                      leftIcon={<CheckCircle2 size={16} />}
                    >
                      {isProcessingPayment ? 'Processing...' : "I've Paid"}
                    </Button>

                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="w-full text-center text-sm text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Cancel Order
                    </button>

                    {/* Security Note */}
                    <div className="flex items-center gap-3 bg-brand-accent/10 dark:bg-brand-accent/20 border border-brand-primary/20 dark:border-brand-primary/30 rounded-xl p-3">
                      <div className="w-9 h-9 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center shrink-0">
                        <Shield size={16} className="text-brand-primary dark:text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Secure Transaction</p>
                        <p className="text-xs text-stone-400">Your payment is verified manually by our team.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Submitted Confirmation */}
            {currentStatus === 'payment_pending' && isProcessingPayment && (
              <motion.div
                key="submitted-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-green-200 dark:border-green-800 p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="font-playfair text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Payment Submitted!</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                    We're verifying your payment for order <strong>{displayOrderNumber}</strong>. You'll receive a confirmation shortly.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-brand-primary dark:text-brand-accent">
                    <Loader2 size={14} className="animate-spin" />
                    Waiting for verification...
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cancelled State */}
            {isCancelled && (
              <motion.div
                key="cancelled-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-red-200 dark:border-red-800 p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={32} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="font-playfair text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Order Cancelled</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                    Your order <strong>{displayOrderNumber}</strong> has been cancelled. If payment was made, refund will be processed within 3-5 business days.
                  </p>
                  <Button onClick={() => navigate('/menu')}>Back to Menu</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Progress + Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-brand-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                </div>
                <h2 className="font-playfair text-2xl font-bold text-stone-900 dark:text-stone-100">Order Progress</h2>
              </div>
              <div className="flex items-center gap-2">
                {currentOrder && <OrderStatusBadge status={currentOrder.status as Order['status']} />}
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock size={10} /> Live
                </span>
              </div>
            </div>

            {/* Order Summary Card */}
            {orderSummary && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-brand-primary/20 dark:border-stone-800 p-4 mb-4">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {orderSummary.items.map((item, idx) => {
                    const { icon: Icon, gradient } = iconForItem(undefined, item.name);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-800 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg ${gradient} flex items-center justify-center shrink-0`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                          <p className="text-xs text-stone-400">&#x20B9;{item.price} &times; {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal</span>
                    <span>&#x20B9;{orderSummary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Delivery</span>
                    <span>&#x20B9;{orderSummary.delivery_fee}</span>
                  </div>
                  {orderSummary.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-&#x20B9;{orderSummary.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                    <span>Total</span>
                    <span>&#x20B9;{orderSummary.total_amount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Stepper */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-brand-primary/20 dark:border-stone-800 p-6 mb-4">
              {ORDER_STEPS.map((step, idx) => {
                const stepIdx = getStepIndex(step.key);
                const isDone = currentStepIndex >= stepIdx && !isCancelled;
                const isActive = currentStepIndex === stepIdx && !isCancelled;
                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {idx < ORDER_STEPS.length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-10 transition-colors ${isDone ? 'bg-brand-primary' : 'bg-stone-100 dark:bg-stone-800'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 z-10 transition-all ${
                      isDone ? 'bg-brand-primary text-white' :
                      isActive ? 'border-2 border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary' :
                      'bg-stone-100 dark:bg-stone-800 text-stone-400'
                    }`}>
                      {isDone && !isActive ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className="pb-10 flex-1">
                      <p className={`font-semibold text-sm ${isDone || isActive ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDone || isActive ? 'text-stone-500 dark:text-stone-400' : 'text-stone-300 dark:text-stone-600'}`}>
                        {step.desc}
                      </p>
                      {isActive && <p className="text-xs text-brand-primary dark:text-brand-accent font-semibold mt-0.5 animate-pulse">In Progress...</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chef Card */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-brand-primary/20 dark:border-stone-800 p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center shrink-0">
                <ChefHat size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900 dark:text-stone-100">Nikita Prahari</p>
                <p className="text-xs text-stone-400">Cloud Kitchen Expert &bull; 5&#9733; Rated</p>
              </div>
              <a href="https://www.instagram.com/lojikhao_official?igsh=MWlhMms5ZTVoNWxmNw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 text-brand-primary dark:text-brand-accent rounded-full flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
            </div>

            {/* Review Section - shown after delivery */}
            {currentStatus === 'delivered' && (
              <ReviewForm
                existingReview={existingReview as { rating: number; comment: string } | null}
                rating={reviewRating}
                onRatingChange={setReviewRating}
                comment={reviewComment}
                onCommentChange={setReviewComment}
                onSubmit={handleSubmitReview}
                isSubmitting={submittingReview}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Review Form Component ─────────────────────────────────────────────
function ReviewForm({ existingReview, rating, onRatingChange, comment, onCommentChange, onSubmit, isSubmitting }: {
  existingReview: { rating: number; comment: string } | null;
  rating: number;
  onRatingChange: (r: number) => void;
  comment: string;
  onCommentChange: (c: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  if (existingReview) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-brand-primary/20 dark:border-stone-800 p-5 text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={20} className={s <= existingReview.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'} />
          ))}
        </div>
        <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Your Review</p>
        {existingReview.comment && <p className="text-sm text-stone-500 mt-1">"{existingReview.comment}"</p>}
        <p className="text-xs text-stone-400 mt-2">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-brand-primary/20 dark:border-stone-800 p-5">
      <h3 className="font-playfair font-bold text-stone-900 dark:text-stone-100 mb-3">Rate Your Experience</h3>
      <p className="text-xs text-stone-500 mb-3">How was your meal from Lo Ji Khao?</p>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" onClick={() => onRatingChange(s)} className="p-0.5 transition-transform hover:scale-110">
            <Star size={28} className={s <= rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200 dark:text-stone-600'} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => onCommentChange(e.target.value)}
        placeholder="Share your thoughts about the food..."
        rows={2}
        className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors bg-stone-50 dark:bg-stone-800 resize-none mb-3"
      />
      <button
        onClick={onSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
