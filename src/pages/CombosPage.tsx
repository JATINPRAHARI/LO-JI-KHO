import { ShoppingCart } from 'lucide-react';
import type { Page, CartItem, MenuItem } from '../types';
import { combos, menuItems } from '../data/menuData';

interface CombosPageProps {
  onNavigate: (page: Page) => void;
  onAddToCart: (item: MenuItem) => void;
  cart: CartItem[];
}

export default function CombosPage({ onNavigate, onAddToCart, cart }: CombosPageProps) {
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#fefce8]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-playfair text-5xl font-bold text-stone-900 mb-2">Value Combos</h1>
        <p className="text-stone-500 mb-10">Best pairings, curated by our chefs. Save more, eat better.</p>

        <div className="space-y-6">
          {combos.map(combo => (
            <div key={combo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 flex">
              <div className="flex-1 p-8">
                <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">{combo.tag}</span>
                <h3 className="font-playfair text-3xl font-bold text-stone-900 mt-2 mb-3">{combo.name}</h3>
                <p className="text-stone-500 leading-relaxed mb-6">{combo.description}</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-playfair text-4xl font-bold text-stone-900">&#x20B9;{combo.price}</span>
                  {combo.originalPrice && (
                    <span className="text-stone-400 line-through">&#x20B9;{combo.originalPrice}</span>
                  )}
                  {combo.originalPrice && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      Save &#x20B9;{combo.originalPrice - combo.price}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('menu')}
                  className="bg-amber-800 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Order Combo
                </button>
              </div>
              {combo.image && (
                <div className="w-56 shrink-0">
                  <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => onNavigate('checkout')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 rounded-full font-semibold shadow-xl flex items-center gap-3 transition-all"
          >
            <ShoppingCart size={18} />
            {cartCount} Items &bull; &#x20B9;{cartTotal}
          </button>
        </div>
      )}
    </div>
  );
}
