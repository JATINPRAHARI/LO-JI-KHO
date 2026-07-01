import { ShoppingCart, RotateCcw, Leaf, Zap, Shield, Star } from 'lucide-react';
import type { Page, CartItem, MenuItem } from '../types';
import { featuredItems, combos, reviews } from '../data/menuData';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onAddToCart: (item: MenuItem) => void;
  cart: CartItem[];
}

const categories = ['All Items', 'Sandwiches', 'Maggi', 'Pasta', 'Cold Coffee'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-stone-300 fill-stone-200'}
        />
      ))}
    </div>
  );
}

export default function HomePage({ onNavigate, onAddToCart, cart }: HomePageProps) {
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#fefce8]">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6">
          <span className="inline-block border border-amber-700 text-amber-800 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
            Premium Cloud Kitchen
          </span>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-stone-900 leading-tight">
            Order the{' '}
            <span className="text-amber-700 italic">Best<br />Local</span>{' '}
            Flavors
          </h1>
          <p className="text-stone-600 text-base max-w-md leading-relaxed">
            Elevating your everyday comfort food. Artisanal Maggi, Gourmet Sandwiches, and Hand-crafted Pastas delivered to your doorstep.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('menu')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-7 py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:shadow-amber-200 active:scale-95"
            >
              Order Now
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="border border-stone-300 text-stone-700 px-7 py-3 rounded-full font-semibold text-sm hover:border-amber-500 hover:text-amber-700 transition-colors"
            >
              View Menu
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Maggi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="bg-amber-600 rounded-2xl px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-playfair text-white text-xl font-bold">Buy 1 Get 1 on Cold Coffee</h3>
            <p className="text-amber-100 text-sm mt-0.5">Limited Time Offer. Beat the heat with our artisanal brews.</p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="bg-white text-amber-700 px-6 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap hover:bg-amber-50 transition-colors shrink-0"
          >
            Claim Offer
          </button>
        </div>
      </section>

      {/* Category Chips */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => onNavigate('menu')}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                i === 0
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-300 text-stone-600 hover:border-amber-500 hover:text-amber-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="max-w-6xl mx-auto px-4 mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-stone-900">Featured Dishes</h2>
            <p className="text-stone-500 text-sm mt-1">Chef&apos;s special selections for you.</p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-amber-700 text-sm font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.isBestSeller && (
                  <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide">
                    Best Seller
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-playfair font-semibold text-stone-900">{item.name}</h3>
                  <span className="font-bold text-stone-900 ml-2">&#x20B9;{item.price}</span>
                </div>
                <p className="text-stone-500 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1 mb-4">
                  <StarRating rating={item.rating} />
                  <span className="text-xs text-stone-400 ml-1">{item.rating} ({item.reviewCount} Reviews)</span>
                </div>
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-200 hover:border-amber-600 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Combos */}
      <section className="max-w-6xl mx-auto px-4 mb-14">
        <h2 className="font-playfair text-3xl font-bold text-stone-900 mb-6">Value Combos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Big combo */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 flex gap-0">
            <div className="flex-1 p-6">
              <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">{combos[0].tag}</span>
              <h3 className="font-playfair text-2xl font-bold text-stone-900 mt-1 mb-2">{combos[0].name}</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-5">{combos[0].description}</p>
              <div className="flex items-baseline gap-2 mb-5">
                <span className="font-playfair text-3xl font-bold text-stone-900">&#x20B9;{combos[0].price}</span>
                <span className="text-stone-400 line-through text-sm">&#x20B9;{combos[0].originalPrice}</span>
              </div>
              <button
                onClick={() => onNavigate('menu')}
                className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                Order Combo
              </button>
            </div>
            <div className="w-40 shrink-0 overflow-hidden">
              <img
                src={combos[0].image}
                alt={combos[0].name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Small combo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">{combos[1].tag}</span>
              <h3 className="font-playfair text-xl font-bold text-stone-900 mt-1 mb-2">{combos[1].name}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{combos[1].description}</p>
            </div>
            <div className="mt-5">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-playfair text-3xl font-bold text-stone-900">&#x20B9;{combos[1].price}</span>
              </div>
              <button
                onClick={() => onNavigate('menu')}
                className="w-full border border-stone-300 hover:border-amber-500 text-stone-700 hover:text-amber-700 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                Quick Order
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Lo Ji Khao */}
      <section className="max-w-6xl mx-auto px-4 mb-14 text-center">
        <h2 className="font-playfair text-3xl font-bold text-stone-900 mb-2">Why Lo Ji Khao?</h2>
        <p className="text-stone-500 text-sm mb-10">Redefining the standards of street-comfort food.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Leaf, title: 'Farm Fresh', desc: 'We source only the freshest organic vegetables and high-quality artisanal breads.' },
            { icon: Zap, title: 'Lightning Fast', desc: 'Optimized kitchen workflow means your food reaches you piping hot in under 30 mins.' },
            { icon: Shield, title: 'Hygienic Prep', desc: '5-star kitchen rated with rigorous daily sanitation protocols.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Icon size={24} className="text-amber-700" />
              </div>
              <h3 className="font-playfair font-bold text-stone-900">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-6xl mx-auto px-4 mb-14">
        <h2 className="font-playfair text-3xl font-bold text-stone-900 mb-2 text-center">What Our Foodies Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
              <StarRating rating={review.rating} />
              <p className="text-stone-600 text-sm mt-3 leading-relaxed italic">{review.text}</p>
              <p className="text-stone-400 text-xs mt-3 font-medium">{review.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => onNavigate('checkout')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-xl flex items-center gap-3 transition-all hover:shadow-amber-200 hover:shadow-2xl"
          >
            <ShoppingCart size={18} />
            <span>{cartCount} Items</span>
            <span className="text-amber-200">&#x20B9;{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
}
