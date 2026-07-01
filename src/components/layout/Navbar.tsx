import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Moon, Sun, LogOut, LayoutDashboard, Menu, X, LogIn, Heart, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../common/NotificationBell';
import { CartDrawer } from '../common/CartDrawer';
import { signOut } from '../../services/auth';

const navLinks = [
  { label: 'Menu', href: '/menu' },
  { label: 'Combos', href: '/#combos' },
];

export function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-stone-950/95 backdrop-blur-md shadow-sm border-b border-stone-100 dark:border-stone-800' : 'bg-brand-bg/90 dark:bg-stone-950/90 backdrop-blur-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/images/WhatsApp Image 2026-06-30 at 12.14.15 AM.jpeg"
              alt="Lo Ji Khao Logo"
              className="w-9 h-9 rounded-full object-cover shadow-sm"
            />
            <div className="hidden sm:block">
              <p className="font-playfair font-bold text-brand-text dark:text-stone-100 text-sm leading-tight">Lo Ji Khao</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest leading-tight">Cloud Kitchen</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.href ? 'text-brand-primary dark:text-brand-accent bg-brand-primary/10 dark:bg-brand-primary/20' : 'text-stone-600 dark:text-stone-400 hover:text-brand-text dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <NotificationBell />

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-brand-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {profile?.name?.[0]?.toUpperCase() ?? <User size={12} />}
                  </div>
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 max-w-20 truncate hidden sm:block">
                    {profile?.name?.split(' ')[0] ?? 'Me'}
                  </span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      onMouseLeave={() => setUserMenuOpen(false)}
                      className="absolute right-0 top-12 w-56 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-800 border-b border-stone-100 dark:border-stone-700">
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{profile?.name ?? 'User'}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5 space-y-0.5">
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors">
                          <User size={15} className="text-amber-600" /> My Dashboard
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors">
                          <ClipboardList size={15} className="text-blue-600" /> My Orders
                        </Link>
                        <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors">
                          <Heart size={15} className="text-red-500" /> Favorites
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 rounded-xl transition-colors border-t border-stone-100 dark:border-stone-700 mt-1 pt-2">
                            <LayoutDashboard size={15} /> Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-stone-100 dark:border-stone-800 p-1.5">
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                <LogIn size={15} /> Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

          {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-stone-50 dark:border-stone-800">
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Account</p>
                    <div className="space-y-0.5">
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl transition-colors">
                        <User size={15} className="text-amber-600" /> Dashboard
                      </Link>
                      <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl transition-colors">
                        <ClipboardList size={15} className="text-blue-600" /> My Orders
                      </Link>
                      <Link to="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl transition-colors">
                        <Heart size={15} className="text-red-500" /> Favorites
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-900 rounded-xl transition-colors">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all shadow-sm"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-3 border-t border-stone-100 dark:border-stone-800">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl transition-all shadow-sm"
                  >
                    <LogIn size={16} /> Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
