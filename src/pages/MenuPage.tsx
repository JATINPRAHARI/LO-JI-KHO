import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Leaf } from 'lucide-react';
import type { Page, CartItem, MenuItem } from '../types';
import { menuItems } from '../data/menuData';

interface MenuPageProps {
  onNavigate: (page: Page) => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

type CategoryFilter = 'all' | 'sandwiches' | 'maggi' | 'pasta' | 'cold-coffee';

const categoryTabs: { label: string; value: CategoryFilter }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Sandwiches', value: 'sandwiches' },
  { label: 'Maggi', value: 'maggi' },
  { label: 'Pasta', value: 'pasta' },
  { label: 'Cold Coffee', value: 'cold-coffee' },
];

export default function MenuPage({ onNavigate, cart, onAddToCart, onUpdateQuantity }: MenuPageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function getQty(id: string) {
    return cart.find(i => i.id === id)?.quantity ?? 0;
  }

  return (
    <div className="min-h-screen bg-[#fefce8]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-5xl font-bold text-amber-800">Artisanal Comfort</h1>
          <p className="text-stone-500 mt-2 max-w-lg leading-relaxed">
            Elevating your daily favorites with premium ingredients and homestyle love. Freshly prepared, delivered with care.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categoryTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={`px-6 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === tab.value
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'border-stone-300 text-stone-600 bg-white hover:border-amber-500 hover:text-amber-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const qty = getQty(item.id);
            return (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {item.isBestSeller && (
                      <span className="bg-amber-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide">
                        Best Seller
                      </span>
                    )}
                    {item.isVeg && (
                      <span className="bg-white/90 backdrop-blur-sm text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-green-200">
                        <Leaf size={9} className="fill-green-600" />
                        VE
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-playfair font-semibold text-stone-900 leading-snug">{item.name}</h3>
                    <span className="font-bold text-stone-900 whitespace-nowrap">&#x20B9;{item.price}</span>
                  </div>
                  <p className="text-stone-500 text-xs leading-relaxed mb-5 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-3 py-2 text-stone-600 hover:bg-amber-50 transition-colors"
                        disabled={qty === 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-2 text-sm font-semibold text-stone-900 min-w-[2rem] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-3 py-2 text-stone-600 hover:bg-amber-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => onNavigate('checkout')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 rounded-full font-semibold shadow-xl flex items-center gap-3 transition-all hover:shadow-amber-200 hover:shadow-2xl"
          >
            <ShoppingCart size={18} />
            <span>{cartCount} Items</span>
            <span className="font-bold">View Cart (&#x20B9;{cartTotal})</span>
          </button>
        </div>
      )}
    </div>
  );
}
