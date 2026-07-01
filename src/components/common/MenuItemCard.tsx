import { useState } from 'react';
import { Heart, Plus, Minus, Star, Leaf, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { MenuItem } from '../../types/database';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import * as favService from '../../services/favorites';
import { iconForItem } from '../../utils/iconForItem';

interface MenuItemCardProps {
  item: MenuItem & { categories?: { name: string; slug: string } | null };
  isFavorite?: boolean;
  onFavoriteChange?: (id: string, isFav: boolean) => void;
}

export function MenuItemCard({ item, isFavorite = false, onFavoriteChange }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const [favLoading, setFavLoading] = useState(false);

  const cartItem = items.find(i => i.menuItem.id === item.id);
  const qty = cartItem?.quantity ?? 0;
  const { icon: Icon, gradient } = iconForItem(item.categories?.slug, item.name);

  async function handleAddToCart() {
    await addItem(item);
    toast.success(`${item.name} added to cart!`);
  }

  async function handleToggleFavorite() {
    if (!user) { toast.error('Login to save favorites'); return; }
    setFavLoading(true);
    try {
      if (isFavorite) {
        await favService.removeFavorite(item.id);
        onFavoriteChange?.(item.id, false);
        toast.success('Removed from favorites');
      } else {
        await favService.addFavorite(item.id);
        onFavoriteChange?.(item.id, true);
        toast.success('Added to favorites!');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group border border-stone-100/80 dark:border-stone-800"
    >
      {/* Icon Placeholder */}
      <div className={`relative h-40 ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 left-3 w-16 h-16 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-white rounded-lg rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white rounded-full" />
        </div>
        <Icon size={52} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.is_best_seller && (
            <span className="bg-brand-accent text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {item.is_veg && (
            <span className="bg-white/95 backdrop-blur-sm text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-green-300 shadow-sm">
              <Leaf size={9} className="fill-green-600" />
              VEG
            </span>
          )}
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${isFavorite ? 'bg-red-500 text-white shadow-md' : 'bg-white/90 text-stone-500 hover:text-red-500 hover:bg-white'}`}
          >
            <Heart size={13} className={isFavorite ? 'fill-white' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-playfair font-semibold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
            {item.name}
          </h3>
          <span className="font-bold text-brand-secondary dark:text-brand-accent whitespace-nowrap text-sm">
            &#x20B9;{item.price}
          </span>
        </div>

        {item.description && (
          <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-1 mb-3">
          <Star size={11} className="text-brand-accent fill-brand-accent" />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Premium</span>
        </div>

        {/* Cart Controls */}
        <div className="flex items-center gap-2">
          {qty > 0 ? (
            <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden flex-1">
              <button
                onClick={() => updateQuantity(item.id, qty - 1)}
                className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="flex-1 text-center text-sm font-bold text-stone-900 dark:text-stone-100">{qty}</span>
              <button
                onClick={() => updateQuantity(item.id, qty + 1)}
                className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-brand-primary/10 dark:bg-brand-primary/20 hover:bg-brand-primary hover:text-white text-brand-primary dark:text-brand-accent border border-brand-primary/30 dark:border-brand-primary/40 hover:border-brand-primary py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
