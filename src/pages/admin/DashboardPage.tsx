import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTodayStats, getAllOrders } from '../../services/orders';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { formatDate } from '../../utils/formatters';
import type { OrderStatus } from '../../types/database';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['today-stats'], queryFn: getTodayStats });
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAllOrders(),
  });

  const recentPending = recentOrders?.filter(o =>
    ['payment_pending', 'waiting_verification', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Dashboard</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Welcome back! Here's today's overview.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Today's Orders"
          value={stats?.total ?? 0}
          loading={statsLoading}
          color="blue"
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Revenue"
          value={`₹${stats?.revenue ?? 0}`}
          loading={statsLoading}
          color="green"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pending"
          value={stats?.pending ?? 0}
          loading={statsLoading}
          color="amber"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Delivered"
          value={stats?.delivered ?? 0}
          loading={statsLoading}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800"
        >
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-amber-600" /> Active Orders
          </h2>
          <div className="space-y-3">
            {ordersLoading && <p className="text-stone-400 text-sm">Loading...</p>}
            {!ordersLoading && (!recentPending || recentPending.length === 0) && (
              <p className="text-stone-400 text-sm text-center py-8">No active orders right now.</p>
            )}
            {recentPending?.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{order.order_number}</p>
                  <p className="text-xs text-stone-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">₹{order.total_amount}</span>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800"
        >
          <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" /> Order Status Summary
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatusPill label="Payment Pending" count={recentOrders?.filter(o => o.status === 'payment_pending').length ?? 0} color="yellow" />
            <StatusPill label="Verifying" count={recentOrders?.filter(o => o.status === 'waiting_verification').length ?? 0} color="blue" />
            <StatusPill label="Accepted" count={recentOrders?.filter(o => o.status === 'accepted').length ?? 0} color="amber" />
            <StatusPill label="Preparing" count={recentOrders?.filter(o => o.status === 'preparing').length ?? 0} color="amber" />
            <StatusPill label="Ready" count={recentOrders?.filter(o => o.status === 'ready').length ?? 0} color="green" />
            <StatusPill label="Out for Delivery" count={recentOrders?.filter(o => o.status === 'out_for_delivery').length ?? 0} color="blue" />
            <StatusPill label="Delivered Today" count={stats?.delivered ?? 0} color="green" />
            <StatusPill label="Cancelled Today" count={stats?.cancelled ?? 0} color="red" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, loading, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
  color: 'blue' | 'green' | 'amber' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-1 mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {loading ? '...' : value}
      </p>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

function StatusPill({ label, count, color }: { label: string; count: number; color: 'yellow' | 'blue' | 'amber' | 'green' | 'red' }) {
  const colors = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${colors[color]}`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
}
