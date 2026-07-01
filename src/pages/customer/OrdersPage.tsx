import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMyOrders } from '../../services/orders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders });

  return (
    <div className="pt-20 min-h-screen bg-[#fefce8] dark:bg-stone-950 pb-10">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8">
          My Orders
        </motion.h1>

        {isLoading && (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}</div>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <EmptyState
            icon={<ShoppingBag size={28} />}
            title="No orders yet."
            description="Your order history will appear here once you place your first order."
            action={<Link to="/menu"><Button>Browse Menu</Button></Link>}
          />
        )}

        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/orders/${order.id}`}>
                  <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800 hover:border-amber-200 dark:hover:border-amber-700 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 font-playfair">{order.order_number}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{formatDate(order.created_at)}</p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {(order as typeof order & { order_items?: { name: string; quantity: number }[] }).order_items
                            ?.slice(0, 2)
                            .map(i => `${i.quantity}x ${i.name}`)
                            .join(', ') ?? 'Loading items...'}
                          {((order as typeof order & { order_items?: unknown[] }).order_items?.length ?? 0) > 2 && ' ...'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-stone-900 dark:text-stone-100">&#x20B9;{order.total_amount}</p>
                      </div>
                    </div>

                    {!['delivered', 'cancelled'].includes(order.status) && (
                      <div className="mt-3">
                        <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${getProgress(order.status)}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50 dark:border-stone-800">
                      <p className="text-xs text-stone-400">{order.delivery_address}</p>
                      <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-semibold">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getProgress(status: string): number {
  const map: Record<string, number> = {
    payment_pending: 10, waiting_verification: 25, accepted: 40,
    preparing: 60, ready: 75, out_for_delivery: 90, delivered: 100, cancelled: 0,
  };
  return map[status] ?? 0;
}
