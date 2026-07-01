import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Heart, MapPin, User, Clock, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getMyOrders } from '../../services/orders';
import { getFavorites } from '../../services/favorites';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';
import { iconForItem } from '../../utils/iconForItem';
import type { Order } from '../../types/database';

const quickLinks = [
  { icon: ShoppingBag, label: 'My Orders', href: '/orders', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  { icon: Heart, label: 'Favorites', href: '/favorites', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  { icon: MapPin, label: 'Addresses', href: '/addresses', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { icon: User, label: 'Profile', href: '/profile', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: () => getMyOrders(user!.id),
    enabled: !!user,
  });
  const { data: favorites } = useQuery({ queryKey: ['favorites'], queryFn: getFavorites });

  const activeOrders = (orders ?? []).filter(o =>
    !['delivered', 'cancelled'].includes(o.status)
  );
  const recentOrders = (orders ?? []).slice(0, 3);

  return (
    <div className="pt-20 pb-10 min-h-screen bg-[#fefce8] dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-amber-700 dark:text-amber-400">
            Namaste, {profile?.name?.split(' ')[0] ?? 'Foodie'}!
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Your premium comfort food is just a few taps away.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders?.length ?? 0, icon: ShoppingBag },
            { label: 'Active Orders', value: activeOrders.length, icon: Clock },
            { label: 'Favorites', value: favorites?.length ?? 0, icon: Heart },
            { label: 'Khao Coins', value: Math.floor((orders?.filter(o => o.status === 'delivered').length ?? 0) * 45), icon: Package },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-amber-50 dark:border-stone-800"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide font-semibold">{label}</p>
                <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Icon size={14} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="font-playfair text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Orders */}
          <div className="lg:col-span-2 space-y-5">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-playfair text-xl font-bold text-stone-900 dark:text-stone-100">Active Orders</h2>
                  <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {activeOrders.length} IN PROGRESS
                  </span>
                </div>
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <Link key={order.id} to={`/orders/${order.id}`}>
                      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-amber-100 dark:border-stone-800 hover:border-amber-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p>
                            <p className="text-xs text-stone-400 mt-0.5">{formatDate(order.created_at)}</p>
                          </div>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-stone-600 dark:text-stone-400">
                            {(order as Order & { order_items?: { name: string }[] }).order_items?.length ?? 0} items
                          </p>
                          <p className="font-bold text-amber-700 dark:text-amber-400">&#x20B9;{order.total_amount}</p>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${getProgress(order.status)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-playfair text-xl font-bold text-stone-900 dark:text-stone-100">Recent Orders</h2>
                <Link to="/orders" className="text-sm text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              {ordersLoading ? (
                <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <OrderCardSkeleton key={i} />)}</div>
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag size={28} />}
                  title="No orders yet."
                  description="Start your first order and enjoy artisanal comfort food!"
                  action={<Link to="/menu"><Button>Browse Menu</Button></Link>}
                />
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <Link key={order.id} to={`/orders/${order.id}`}>
                      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-stone-800 hover:border-amber-200 transition-colors flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center shrink-0">
                          <ShoppingBag size={18} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{order.order_number}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">&#x20B9;{order.total_amount}</p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Links */}
          <div className="space-y-5">
            <div>
              <h2 className="font-playfair text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map(({ icon: Icon, label, href, color }) => (
                  <Link key={href} to={href}>
                    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-stone-800 hover:border-amber-200 dark:hover:border-amber-700 transition-colors text-center">
                      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                        <Icon size={18} />
                      </div>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">{label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Favorites preview */}
            {favorites && favorites.length > 0 && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-playfair font-bold text-stone-900 dark:text-stone-100 text-sm">Your Favorites</h3>
                  <Link to="/favorites" className="text-xs text-brand-primary dark:text-brand-accent hover:underline">View All</Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {favorites.slice(0, 2).map(fav => {
                    const menuItem = fav as { id: string; menu_items: { name: string; categories?: { slug: string } | null } };
                    const { icon: Icon, gradient } = iconForItem(menuItem.menu_items?.categories?.slug, menuItem.menu_items?.name);
                    return (
                      <div key={fav.id} className={`relative rounded-xl overflow-hidden h-20 ${gradient} flex items-center justify-center group`}>
                        <Icon size={28} className="text-white/80 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <p className="absolute bottom-1.5 left-2 right-2 text-white text-[10px] font-semibold truncate">
                          {menuItem.menu_items?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getProgress(status: string): number {
  const map: Record<string, number> = {
    payment_pending: 10,
    waiting_verification: 25,
    accepted: 40,
    preparing: 60,
    ready: 75,
    out_for_delivery: 90,
    delivered: 100,
    cancelled: 0,
  };
  return map[status] ?? 0;
}
