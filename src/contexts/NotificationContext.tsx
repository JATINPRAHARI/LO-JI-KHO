import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import * as notifService from '../services/notifications';
import type { Notification } from '../types/database';
import { useAuth } from './AuthContext';
import { useBrowserNotification } from '../hooks/useBrowserNotification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const { showBrowserNotification, playAlarmSound, playBellSound } = useBrowserNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const data = isAdmin
      ? await notifService.getAllNotifications()
      : await notifService.getNotifications(user.id);
    setNotifications(data as Notification[]);
    setUnreadCount((data as Notification[]).filter(n => !n.is_read).length);
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refreshNotifications();

    const channelName = isAdmin ? 'admin-notifications-global' : `notifications:${user.id}`;
    const channelFilter = isAdmin
      ? { event: 'INSERT' as const, schema: 'public' as const, table: 'notifications' as const }
      : { event: 'INSERT' as const, schema: 'public' as const, table: 'notifications' as const, filter: `user_id=eq.${user.id}` };

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelFilter, (payload) => {
        const newNotif = payload.new as Notification;
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount(c => c + 1);

        // Play sound - alarm for admin, bell for customer
        if (isAdmin) { playAlarmSound(); } else { playBellSound(); }

        // Show browser notification
        showBrowserNotification(newNotif.title, newNotif.message);

        // Show sonner toast as well
        toast(newNotif.title, {
          description: newNotif.message,
          duration: 10000,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin, refreshNotifications, showBrowserNotification, playAlarmSound, playBellSound]);

  const markAsRead = useCallback(async (id: string) => {
    await notifService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notifService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await notifService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
