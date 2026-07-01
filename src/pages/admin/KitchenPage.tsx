import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChefHat, Package, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';
import type { Order, OrderStatus } from '../../types/database';
import { usePageTitle } from '../../../hooks/usePageTitle';

const KITCHEN_STATUSES: OrderStatus[] = ['accepted', 'preparing', 'ready', 'out_for_delivery'];

export default function KitchenPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => getAllOrders(),
  });

  const kitchenOrders = orders?.filter(o => KITCHEN_STATUSES.includes(o.status as OrderStatus));
  const grouped = {
    accepted: kitchenOrders?.filter(o => o.status === 'accepted') ?? [],
    preparing: kitchenOrders?.filter(o => o.status === 'preparing') ?? [],
    ready: kitchenOrders?.filter(o => o.status === 'ready') ?? [],
    out_for_delivery: kitchenOrders?.filter(o => o.status === 'out_for_delivery') ?? [],
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <ChefHat size={32} className="text-amber-600" /> Kitchen Queue
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Real-time order management</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Refresh
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            <KanbanColumn
              title="Accepted"
              icon={<Check size={16} />}
              orders={grouped.accepted}
              color="amber"
              actions={order => (
                <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: 'preparing' })} isLoading={statusMutation.isPending}>
                  Start Cooking
                </Button>
              )}
            />
            <KanbanColumn
              title="Preparing"
              icon={<ChefHat size={16} />}
              orders={grouped.preparing}
              color="amber"
              actions={order => (
                <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: 'ready' })} isLoading={statusMutation.isPending}>
                  Mark Ready
                </Button>
              )}
            />
            <KanbanColumn
              title="Ready"
              icon={<Package size={16} />}
              orders={grouped.ready}
              color="green"
              actions={order => (
                <Button size="sm" onClick={() => statusMutation.mutate({ id: order.id, status: 'out_for_delivery' })} isLoading={statusMutation.isPending}>
                  Dispatch
                </Button>
              )}
            />
            <KanbanColumn
              title="Dispatched"
              icon={<Truck size={16} />}
              orders={grouped.out_for_delivery}
              color="blue"
              actions={order => (
                <Button size="sm" variant="success" onClick={() => statusMutation.mutate({ id: order.id, status: 'delivered' })} isLoading={statusMutation.isPending}>
                  Delivered
                </Button>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ title, icon, orders, color, actions }: {
  title: string;
  icon: React.ReactNode;
  orders: (Order & { order_items?: { name: string; quantity: number; is_veg: boolean }[] })[];
  color: 'blue' | 'amber' | 'green';
  actions: (order: Order) => React.ReactNode;
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  const textColors = {
    blue: 'text-blue-700 dark:text-blue-400',
    amber: 'text-amber-700 dark:text-amber-400',
    green: 'text-green-700 dark:text-green-400',
  };

  return (
    <div className="w-72 shrink-0">
      <div className={`rounded-xl p-3 mb-3 border ${colors[color]} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className={`font-semibold text-sm ${textColors[color]}`}>{title}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-stone-900 ${textColors[color]}`}>
          {orders.length}
        </span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
        {orders.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm">No orders</div>
        )}
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-stone-900 rounded-xl p-3 border border-stone-100 dark:border-stone-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">{order.order_number}</p>
              <p className="text-xs text-stone-400">{formatDate(order.created_at, 'time')}</p>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">{order.customer_name}</p>
              <p className="text-xs text-stone-400">₹{order.total_amount}</p>
            </div>
            <div className="space-y-1 mb-3">
              {order.order_items?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${item.is_veg ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600'}`} />
                  <span className="text-stone-600 dark:text-stone-400">{item.quantity}x {item.name}</span>
                </div>
              ))}
              {(order.order_items?.length ?? 0) > 3 && (
                <p className="text-xs text-stone-400">+{(order.order_items?.length ?? 0) - 3} more</p>
              )}
            </div>
            {actions(order)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
