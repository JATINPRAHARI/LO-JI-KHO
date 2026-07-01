import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, ShoppingBag, UtensilsCrossed, Tag, ChefHat,
  LogOut, Moon, Sun, Menu, X, QrCode, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { signOut } from '../../services/auth';
import { AdminNotificationBell } from '../common/AdminNotificationBell';

const navItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: ChefHat, label: 'Kitchen', href: '/admin/kitchen' },
  { icon: UtensilsCrossed, label: 'Menu', href: '/admin/menu' },
  { icon: Tag, label: 'Offers', href: '/admin/offers' },
  { icon: QrCode, label: 'QR / UPI', href: '/admin/qr' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out');
    } catch {
      toast.error('Failed to sign out');
    }
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-64' : collapsed ? 'w-16' : 'w-56'} flex flex-col bg-stone-900 dark:bg-stone-950 min-h-screen transition-all duration-300`}>
      <div className={`p-4 border-b border-stone-800 flex items-center ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-sm font-playfair shrink-0">LK</div>
            <div>
              <p className="text-white text-xs font-bold font-playfair leading-tight">Lo Ji Khao</p>
              <p className="text-stone-500 text-[9px] uppercase tracking-wider">Kitchen</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {(!collapsed || mobile) && <AdminNotificationBell />}
          {!mobile && (
            <button onClick={() => setCollapsed(c => !c)} className="text-stone-400 hover:text-white transition-colors p-1">
              <Menu size={16} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-brand-primary text-white shadow-sm' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
            >
              <Icon size={17} className="shrink-0" />
              {(!collapsed || mobile) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t border-stone-800 space-y-2`}>
        <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <Home size={15} />
          {(!collapsed || mobile) && 'Back to Site'}
        </Link>
        <button onClick={toggleTheme} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {(!collapsed || mobile) && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </button>

        {(!collapsed || mobile) && (
          <div className="px-3 py-2 rounded-xl bg-stone-800">
            <p className="text-xs font-semibold text-white truncate">{profile?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">Super Admin</p>
          </div>
        )}

        <button onClick={handleSignOut} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-900/20 transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <LogOut size={15} />
          {(!collapsed || mobile) && 'Sign Out'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#fefce8] dark:bg-stone-950">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
          <button onClick={() => setMobileOpen(true)} className="text-stone-600 dark:text-stone-400 p-1">
            <Menu size={20} />
          </button>
          <p className="font-playfair font-bold text-stone-900 dark:text-stone-100">Admin Panel</p>
          <button onClick={() => setMobileOpen(false)} className={`ml-auto ${mobileOpen ? 'block' : 'hidden'}`}>
            <X size={20} />
          </button>
        </div>
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
