import { RotateCcw, Home, Briefcase, PlusCircle, MapPin, Heart, Pencil } from 'lucide-react';
import type { Page } from '../types';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
}

const orderHistory = [
  { id: 'h1', name: 'Artisanal Grilled Sandwich Meal', date: 'Yesterday, 8:45 PM', price: 450 },
  { id: 'h2', name: 'Creamy Alfredo Pasta (Ex-Cheese)', date: '12 Oct 2023, 1:20 PM', price: 380 },
];

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-[#fefce8]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-playfair text-5xl font-bold text-amber-700 mb-1">Namaste, Rohan!</h1>
        <p className="text-stone-500 mb-8">Your premium comfort food is just a few taps away.</p>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            {/* Active Orders */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-playfair text-2xl font-bold text-stone-900">Active Orders</h2>
                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  1 IN PROGRESS
                </span>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=120"
                    alt="Peri Peri Maggi"
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-playfair font-semibold text-stone-900 text-sm">
                      Peri-Peri Cheese Maggi &amp; Masala Chai
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">Order #LJK-8829 &bull; Est. Arrival: 12 Mins</p>
                    {/* Progress bar */}
                    <div className="mt-3 relative">
                      <div className="h-1.5 bg-stone-100 rounded-full">
                        <div className="h-full w-2/3 bg-amber-500 rounded-full" />
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
                        <span>Kitchen</span>
                        <span className="font-semibold text-amber-600">Out for Delivery</span>
                        <span>Arrived</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('track')}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0"
                  >
                    Track
                  </button>
                </div>
              </div>
            </section>

            {/* Order History */}
            <section>
              <h2 className="font-playfair text-2xl font-bold text-stone-900 mb-4">Order History</h2>
              <div className="space-y-3">
                {orderHistory.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                        <path d="M3 11l19-9-9 19-2-8-8-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-stone-900">{order.name}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">{order.date} &bull; &#x20B9;{order.price}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('menu')}
                      className="border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-700 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <RotateCcw size={12} />
                      RE-ORDER
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {}}
                className="text-amber-700 text-sm font-semibold hover:underline mt-4 block text-center w-full"
              >
                View All Previous Orders
              </button>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 space-y-5">
            {/* Profile card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-50 text-center">
              <div className="relative inline-block mb-3">
                <img
                  src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120"
                  alt="Rohan Malhotra"
                  className="w-20 h-20 rounded-full object-cover mx-auto"
                />
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white">
                  <Pencil size={10} />
                </button>
              </div>
              <h3 className="font-playfair font-bold text-stone-900 text-lg">Rohan Malhotra</h3>
              <p className="text-stone-400 text-sm mt-0.5">+91 98765 43210</p>

              <div className="flex items-center justify-around mt-5 pt-5 border-t border-stone-100">
                <div className="text-center">
                  <p className="font-bold text-stone-900 text-lg">12</p>
                  <p className="text-xs text-stone-400">Orders</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-stone-900 text-lg">4.8<span className="text-amber-500 text-sm">★</span></p>
                  <p className="text-xs text-stone-400">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-stone-900 text-lg">540</p>
                  <p className="text-xs text-stone-400">Khao Coins</p>
                </div>
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
              <h3 className="font-playfair font-bold text-stone-900 mb-4">Favorites</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cheesy Sourdough', img: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=200' },
                  { label: 'Double Choco Shake', img: 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=200' },
                ].map(fav => (
                  <div key={fav.label} className="relative rounded-xl overflow-hidden h-24 group cursor-pointer">
                    <img src={fav.img} alt={fav.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Heart size={14} className="absolute top-2 right-2 text-white fill-white" />
                    <p className="absolute bottom-2 left-2 text-white text-xs font-semibold leading-tight">{fav.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair font-bold text-stone-900">Saved Addresses</h3>
                <button className="text-stone-400 hover:text-amber-700 transition-colors">
                  <PlusCircle size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Home size={16} className="text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Home</p>
                    <p className="text-xs text-stone-500 mt-0.5">Apt 402, Sunshine Residency, Bandra West, Mumbai</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <Briefcase size={16} className="text-stone-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Office</p>
                    <p className="text-xs text-stone-500 mt-0.5">Floor 12, Nexus Tech Park, Lower Parel, Mumbai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
