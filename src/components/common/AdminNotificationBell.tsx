import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Package, ChefHat, Bike, Home, AlertCircle, Info, Tag, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import * as notifService from '../../services/notifications';
import type { Notification, NotificationType } from '../../types/database';
import { formatDistanceToNow } from '../../utils/formatters';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  order_received: <Package size={16} className="text-blue-500" />,
  payment_pending: <AlertCircle size={16} className="text-yellow-500" />,
  accepted: <ChefHat size={16} className="text-amber-500" />,
  preparing: <ChefHat size={16} className="text-amber-500" />,
  ready: <CheckCheck size={16} className="text-green-500" />,
  out_for_delivery: <Bike size={16} className="text-blue-500" />,
  delivered: <Home size={16} className="text-green-500" />,
  cancelled: <X size={16} className="text-red-500" />,
  info: <Info size={16} className="text-stone-500" />,
  offer: <Tag size={16} className="text-amber-500" />,
};

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all notifications (admin sees everything)
    notifService.getAllNotifications().then(data => {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    });

    // Subscribe to all new notifications (no user filter)
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(c => c + 1);
        // Show toast for new order/payment notifications
        const type = (payload.new as Notification).type;
        if (type === 'order_received' || type === 'payment_pending') {
          toast.info(`New order: ${(payload.new as Notification).title}`);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarkAllRead() {
    await notifService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function handleClick(n: Notification) {
    if (!n.is_read) {
      await notifService.markAsRead(n.id);
      setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, is_read: true } : p));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    if (n.order_id) {
      setIsOpen(false);
      navigate(`/admin/orders`);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="absolute right-0 top-12 w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <ShoppingBag size={16} className="text-brand-primary" />
                Order Notifications
              </h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-brand-primary font-semibold hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-stone-400 text-sm py-8">No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left p-4 flex gap-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b border-stone-50 dark:border-stone-800 ${!n.is_read ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                      {typeIcons[n.type as NotificationType] ?? <Info size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">{n.title}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-stone-400 mt-1">{formatDistanceToNow(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="p-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => { setIsOpen(false); navigate('/admin/orders'); }}
                className="w-full text-center text-sm text-brand-primary font-semibold hover:underline"
              >
                View All Orders
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
