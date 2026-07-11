import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Leaf, ChevronRight, Truck, Heart, Sparkles, Plus, Minus, Trash2, Clock } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { getCategories, getMenuItems } from '../../services/menu';
import type { MenuItem } from '../../types/database';
import { usePageTitle } from '../../hooks/usePageTitle';
import { toast } from 'sonner';

interface CategoryDisplay {
  id: string;
  name: string;
  emoji: string;
  image: string;
  note?: string;
  slug: string;
}

const categoryMeta: Record<string, { emoji: string; image: string; note?: string }> = {
  maggi: { emoji: '🍜', image: 'https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=600' },
  sandwiches: { emoji: '🥪', image: 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=600', note: 'No Mayo' },
  pasta: { emoji: '🍝', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600', note: 'Only Sooji Pasta' },
  'cold-coffee': { emoji: '🧋', image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600' },
  specials: { emoji: '🌟', image: 'https://images.pexels.com/photos/5946507/pexels-photo-5946507.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'protein-ladoo': { emoji: '💪', image: 'https://images.pexels.com/photos/5946507/pexels-photo-5946507.jpeg?auto=compress&cs=tinysrgb&w=600', note: '250GM' },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function MenuItemRow({ item, index, disabled }: { item: MenuItem; index: number; disabled?: boolean }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.menuItem.id === item.id);
  const qty = cartItem?.quantity ?? 0;

  async function handleAdd() {
    if (disabled) return;
    await addItem(item);
    toast.success(`${item.name} added to cart!`);
  }

  return (
    <motion.div
      variants={itemAnim}
      className={`flex items-center justify-between py-3.5 border-b border-stone-100 dark:border-stone-800 last:border-b-0 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-mono w-5 shrink-0">{String(index + 1).padStart(2, '0')}</span>
          <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm leading-tight">{item.name}</h4>
          {item.is_veg && <Leaf size={11} className="text-green-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 ml-7">
          <p className="text-xs text-stone-500 dark:text-stone-400">{item.description}</p>
          {item.weight && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700 shrink-0">
              {item.weight}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">₹{item.price}</span>
        {qty > 0 ? (
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, qty - 1)}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
            >
              {qty === 1 ? <Trash2 size={11} className="text-red-500" /> : <Minus size={11} />}
            </button>
            <span className="px-2 text-xs font-bold text-stone-900 dark:text-stone-100">{qty}</span>
            <button
              onClick={() => updateQuantity(item.id, qty + 1)}
              className="px-2 py-1.5 text-stone-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
          >
            <ShoppingCart size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function MenuPage() {
  const [activeCatSlug, setActiveCatSlug] = useState<string>('maggi');
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    function check() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      setIsOpen((mins >= 11 * 60 && mins < 15 * 60) || (mins >= 19 * 60 && mins < 22 * 60));
    }
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: allItems = [] } = useQuery({
    queryKey: ['menu', 'all', ''],
    queryFn: () => getMenuItems('all', ''),
    staleTime: 30000,
  });

  const displayCats: CategoryDisplay[] = useMemo(
    () =>
      categories
        .filter(c => c.slug !== 'burger')
        .map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          ...(categoryMeta[c.slug] || { emoji: '🍽️', image: c.image_url }),
        })),
    [categories],
  );

  const activeDisplayCat = displayCats.find(c => c.slug === activeCatSlug);
  const filteredItems = useMemo(
    () =>
      allItems.filter(i => {
        const cat = categories.find(c => c.id === i.category_id);
        return cat && cat.slug === activeCatSlug;
      }),
    [allItems, categories, activeCatSlug],
  );

  return (
    <div className="min-h-screen bg-[#fefce8] dark:bg-stone-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-amber-200 text-xs font-medium mb-6 border border-white/10">
              <Sparkles size={14} />
              Premium Cafe Experience
            </div>
            <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-3 leading-tight">
              Lo Ji Khao
            </h1>
            <p className="text-amber-200/80 text-lg sm:text-xl font-light tracking-wide">Good Food. Good Mood.</p>
            <div className="flex items-center justify-center gap-6 mt-6 text-amber-300/60 text-xs">
              <span className="flex items-center gap-1.5"><Leaf size={13} /> Fresh Ingredients</span>
              <span className="flex items-center gap-1.5"><Heart size={13} /> Made with Love</span>
              <span className="flex items-center gap-1.5"><Truck size={13} /> Quick Service</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Closed Banner */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <Clock size={18} />
              <span className="font-bold text-sm">We are currently closed</span>
            </div>
            <p className="text-xs text-red-500 dark:text-red-400">
              Ordering is available from:<br />
              11:00 AM – 3:00 PM &nbsp;and&nbsp; 7:00 PM – 10:00 PM
            </p>
          </motion.div>
        )}

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {displayCats.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveCatSlug(cat.slug)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                activeCatSlug === cat.slug
                  ? 'ring-2 ring-amber-600 shadow-lg shadow-amber-900/20 scale-[1.02]'
                  : 'hover:shadow-md hover:scale-[1.01]'
              }`}
              style={{
                background: activeCatSlug === cat.slug
                  ? 'linear-gradient(135deg, #92400e, #78350f)'
                  : 'linear-gradient(135deg, #fff, #fef3c7)',
              }}
            >
              <div className="text-2xl mb-2">{cat.emoji}</div>
              <p className={`font-bold text-sm ${activeCatSlug === cat.slug ? 'text-amber-100' : 'text-stone-800'}`}>
                {cat.name}
              </p>
              {cat.note && (
                <p className={`text-[10px] mt-0.5 font-medium ${activeCatSlug === cat.slug ? 'text-amber-300' : 'text-amber-700'}`}>
                  {cat.note}
                </p>
              )}
              {activeCatSlug === cat.slug && (
                <ChevronRight size={14} className="absolute bottom-3 right-3 text-amber-300" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Menu Items */}
        <AnimatePresence mode="wait">
          {activeDisplayCat && (
            <motion.div
              key={activeDisplayCat.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={activeDisplayCat.image}
                    alt={activeDisplayCat.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeDisplayCat.emoji}</span>
                      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">{activeDisplayCat.name}</h2>
                    </div>
                    {activeDisplayCat.note && (
                      <p className="text-amber-300 text-xs font-medium mt-1 ml-1">{activeDisplayCat.note}</p>
                    )}
                  </div>
                </div>

                <motion.div
                  initial="hidden"
                  animate="show"
                  className="p-6"
                >
                  {filteredItems.length === 0 && (
                    <p className="text-center text-stone-400 text-sm py-8">Loading menu items...</p>
                  )}
                  {filteredItems.map((item, idx) => (
                    <MenuItemRow key={item.id} item={item} index={idx} disabled={!isOpen} />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center pb-6"
        >
          <div className="border-t border-stone-200 dark:border-stone-800 pt-8">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-stone-500 dark:text-stone-400 mb-4">
              <span className="flex items-center gap-1.5"><Leaf size={12} /> No Compromise on Quality</span>
              <span className="flex items-center gap-1.5"><Sparkles size={12} /> Fresh Ingredients</span>
              <span className="flex items-center gap-1.5"><Heart size={12} /> Made with Love</span>
            </div>
            <p className="font-playfair text-lg text-stone-400 dark:text-stone-500">Good Food. Good Mood.</p>
            <p className="text-[10px] text-stone-300 dark:text-stone-600 mt-1">Lo Ji Khao &mdash; Premium Cafe</p>
          </div>
        </motion.div>
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 right-6 z-20"
          >
            <button
              onClick={() => {
                if (!isOpen) {
                  toast.error('We are currently closed. Ordering is available from 11:00 AM – 3:00 PM and 7:00 PM – 10:00 PM.');
                  return;
                }
                navigate('/checkout');
              }}
              className={`text-white px-6 py-3.5 rounded-full font-semibold shadow-xl flex items-center gap-3 transition-all hover:shadow-2xl ${!isOpen ? 'bg-stone-500 cursor-not-allowed' : 'bg-amber-800 hover:bg-amber-900'}`}
            >
              <ShoppingCart size={18} />
              <span>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
              <span className="text-amber-200 text-sm">Cart (&#x20B9;{subtotal + 50})</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
