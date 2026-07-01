import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getFavorites, removeFavorite } from '../../services/favorites';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { iconForItem } from '../../utils/iconForItem';
import { useCart } from '../../contexts/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useQuery({ queryKey: ['favorites'], queryFn: getFavorites });
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
      toast.success('Removed from favorites');
    },
  });

  async function handleAddToCart(item: { id: string; menu_items: { id: string; name: string; price: number; image_url: string; is_veg: boolean; is_active: boolean; category_id: string | null } }) {
    if (!item.menu_items) return;
    await addItem(item.menu_items as never);
    toast.success('Added to cart!');
  }

  return (
    <div className="pt-20 min-h-screen bg-[#fefce8] dark:bg-stone-950 pb-10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-playfair text-4xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
              <Heart size={28} className="text-red-500 fill-red-500" /> Your Favorites
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Items you love, saved for quick ordering.</p>
          </div>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl p-4 animate-pulse border border-stone-100 dark:border-stone-800">
                <div className="w-full h-32 bg-stone-200 dark:bg-stone-800 rounded-xl mb-3" />
                <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!favorites || favorites.length === 0) && (
          <EmptyState
            icon={<Heart size={28} className="text-red-400" />}
            title="No favorites yet."
            description="Start adding items you love by tapping the heart icon on any menu item."
            action={<Link to="/menu"><Button>Browse Menu</Button></Link>}
          />
        )}

        {!isLoading && favorites && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(favorites as { id: string; menu_items: { id: string; name: string; price: number; description: string; image_url: string; is_veg: boolean; categories?: { name: string; slug: string } | null } | null }[])
              .filter(f => f.menu_items)
              .map((fav, i) => {
              const item = fav as { id: string; menu_items: { id: string; name: string; price: number; description: string; image_url: string; is_veg: boolean; categories?: { name: string; slug: string } | null } };
              const { icon: Icon, gradient } = iconForItem(item.menu_items.categories?.slug, item.menu_items.name);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden group"
                >
                  <div className={`relative h-32 ${gradient} flex items-center justify-center`}>
                    <Icon size={48} className="text-white/60 group-hover:scale-110 transition-transform" />
                    <button
                      onClick={() => removeMutation.mutate(item.menu_items.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Heart size={14} className="text-red-500 fill-red-500" />
                    </button>
                    {item.menu_items.is_veg && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded border-2 border-green-600 bg-green-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">{item.menu_items.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{item.menu_items.categories?.name ?? ''}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-amber-700 dark:text-amber-400">&#x20B9;{item.menu_items.price}</span>
                      <Button size="sm" onClick={() => handleAddToCart(item as never)} leftIcon={<ShoppingBag size={13} />}>
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}