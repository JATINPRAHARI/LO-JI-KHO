import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { iconForItem } from '../../utils/iconForItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const delivery = 50;
  const total = subtotal + delivery;

  function handleCheckout() {
    onClose();
    navigate('/checkout');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-stone-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-primary" />
                <h2 className="font-playfair font-bold text-lg text-stone-900 dark:text-stone-100">Your Cart</h2>
                {items.length > 0 && (
                  <span className="bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag size={28} />}
                  title="Your cart is empty"
                  description="Add some delicious items from our menu!"
                  action={
                    <Button variant="primary" size="sm" onClick={() => { onClose(); navigate('/menu'); }}>
                      Browse Menu
                    </Button>
                  }
                />
              ) : (
                items.map(item => {
                  const { icon: Icon, gradient } = iconForItem(undefined, item.menuItem.name);
                  return (
                    <div key={item.menuItem.id} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                      <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center shrink-0`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">{item.menuItem.name}</p>
                        <p className="text-sm font-bold text-brand-secondary dark:text-brand-accent mt-0.5">&#x20B9;{item.menuItem.price * item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 size={13} className="text-red-500" /> : <Minus size={13} />}
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-stone-900 dark:text-stone-100">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal</span>
                    <span>&#x20B9;{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Delivery</span>
                    <span>&#x20B9;{delivery}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 pt-1.5 border-t border-stone-100 dark:border-stone-800">
                    <span>Total</span>
                    <span>&#x20B9;{total}</span>
                  </div>
                </div>
                <Button onClick={handleCheckout} size="lg" className="w-full" rightIcon={<ArrowRight size={16} />}>
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
