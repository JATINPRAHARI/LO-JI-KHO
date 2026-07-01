import { useState } from 'react';
import {
  BarChart3, ShoppingBag, UtensilsCrossed, Tag, ChefHat, Calendar,
  Download, Search, Eye, Star, TrendingUp, Plus, CheckCircle2, Clock, Package
} from 'lucide-react';

type AdminSection = 'analytics' | 'orders' | 'menu' | 'coupons' | 'queue';

const sidebarItems: { icon: React.ElementType; label: string; id: AdminSection }[] = [
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: ShoppingBag, label: 'Orders', id: 'orders' },
  { icon: UtensilsCrossed, label: 'Menu Management', id: 'menu' },
  { icon: Tag, label: 'Coupons', id: 'coupons' },
  { icon: ChefHat, label: 'Kitchen Queue', id: 'queue' },
];

const kitchenOrders = [
  {
    id: 'ko1',
    customer: 'Rahul Sharma',
    phone: '+91 98765 43210',
    items: ['1× Grilled Cheese Sandwich', '2× Masala Maggi (Extra Spicy)', '1× Cold Coffee'],
    total: 540,
    status: 'PREPARING' as const,
  },
  {
    id: 'ko2',
    customer: 'Ananya Singh',
    phone: '+91 91234 56789',
    items: ['2× Paneer Makhani Pasta'],
    total: 780,
    status: 'PENDING' as const,
  },
  {
    id: 'ko3',
    customer: 'Vikram V.',
    phone: '+91 88888 77777',
    items: ['1× Nutella Sandwich', '1× Hot Chocolate'],
    total: 320,
    status: 'READY' as const,
  },
];

const recentOrders = [
  { id: '#LJK-9021', customer: 'Zaid Malik', amount: 1240, status: 'DELIVERED', date: '10:45 AM' },
  { id: '#LJK-9020', customer: 'Priya V.', amount: 450, status: 'CANCELLED', date: '10:30 AM' },
  { id: '#LJK-9019', customer: 'Siddharth R.', amount: 890, status: 'DELIVERED', date: '10:12 AM' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    PREPARING: 'bg-amber-100 text-amber-700',
    READY: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-stone-100 text-stone-600'}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('analytics');
  const [kitchenOrders_, setKitchenOrders_] = useState(kitchenOrders);

  function handleAction(id: string, action: 'accept' | 'reject' | 'ready' | 'delivered') {
    setKitchenOrders_(prev =>
      prev.map(o => {
        if (o.id !== id) return o;
        if (action === 'accept') return { ...o, status: 'PREPARING' as const };
        if (action === 'ready') return { ...o, status: 'READY' as const };
        if (action === 'delivered') return { ...o, status: 'READY' as const };
        return o;
      }).filter(o => action === 'reject' ? o.id !== id : true)
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fefce8]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white border-r border-stone-100 flex flex-col min-h-screen">
        <div className="p-5 border-b border-stone-100">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 bg-amber-800 rounded-2xl flex items-center justify-center text-white font-bold font-playfair text-xl">
              LK
            </div>
            <span className="text-sm font-semibold text-stone-800">Lo Ji Khao Kitchen</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {sidebarItems.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-xs font-bold text-stone-600">
              AU
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900">Admin User</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-stone-900">Dashboard Overview</h1>
              <p className="text-stone-500 text-sm mt-1">Welcome back. Here is what&apos;s happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-600 bg-white">
                <Calendar size={15} />
                Oct 24, 2024
              </div>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                <Download size={15} />
                Download Report
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
              <p className="text-xs text-stone-400 uppercase font-semibold tracking-wide mb-2">Daily Revenue</p>
              <div className="flex items-end gap-3">
                <span className="font-playfair text-3xl font-bold text-stone-900">&#x20B9;42,850</span>
                <span className="text-green-600 text-sm font-semibold mb-1">+12.5%</span>
              </div>
              <div className="mt-3 h-1.5 bg-stone-100 rounded-full">
                <div className="h-full w-3/4 bg-amber-500 rounded-full" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
              <p className="text-xs text-stone-400 uppercase font-semibold tracking-wide mb-2">Total Orders</p>
              <div className="flex items-end gap-3">
                <span className="font-playfair text-3xl font-bold text-stone-900">158</span>
                <span className="text-green-600 text-sm font-semibold mb-1">+4.2%</span>
              </div>
              <div className="mt-3 h-1.5 bg-stone-100 rounded-full">
                <div className="h-full w-2/3 bg-amber-500 rounded-full" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
              <p className="text-xs text-stone-400 uppercase font-semibold tracking-wide mb-2">Top Selling Item</p>
              <p className="font-playfair text-xl font-bold text-stone-900">Peri Peri Maggi</p>
              <p className="text-xs text-stone-400 mt-1">42 Sold Today</p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-amber-300' : 'bg-amber-200'}`} />
                ))}
                <span className="text-xs text-stone-400 ml-1">+12</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Kitchen Queue */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <ChefHat size={18} className="text-amber-700" />
                <h2 className="font-playfair font-bold text-stone-900 text-lg">Kitchen Queue</h2>
                <span className="ml-auto bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {kitchenOrders_.length} LIVE
                </span>
              </div>

              {kitchenOrders_.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{order.customer}</p>
                      <p className="text-xs text-stone-400">{order.phone}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <ul className="text-xs text-stone-600 space-y-0.5 mb-3">
                    {order.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">&#x20B9;{order.total}.00</span>
                    <div className="flex gap-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(order.id, 'reject')}
                            className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(order.id, 'accept')}
                            className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                        </>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleAction(order.id, 'ready')}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          Ready
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={() => handleAction(order.id, 'delivered')}
                          className="px-3 py-1 rounded-lg bg-stone-600 text-white text-xs font-semibold hover:bg-stone-700 transition-colors"
                        >
                          Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right panel */}
            <div className="col-span-3 space-y-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-playfair font-bold text-stone-900">Recent Orders</h2>
                  <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-1.5">
                    <Search size={13} className="text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="text-xs outline-none text-stone-600 w-28 bg-transparent"
                    />
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-stone-400 uppercase">
                      <th className="text-left pb-3 font-semibold">Order ID</th>
                      <th className="text-left pb-3 font-semibold">Customer</th>
                      <th className="text-left pb-3 font-semibold">Amount</th>
                      <th className="text-left pb-3 font-semibold">Status</th>
                      <th className="text-left pb-3 font-semibold">Date</th>
                      <th className="text-left pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="py-3 text-amber-700 font-semibold text-xs">{order.id}</td>
                        <td className="py-3 text-stone-700 text-xs">{order.customer}</td>
                        <td className="py-3 text-stone-900 font-semibold text-xs">&#x20B9;{order.amount.toLocaleString()}</td>
                        <td className="py-3"><StatusBadge status={order.status} /></td>
                        <td className="py-3 text-stone-400 text-xs">{order.date}</td>
                        <td className="py-3">
                          <button className="text-stone-400 hover:text-amber-700 transition-colors">
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Menu Quick Stats */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-playfair font-bold text-stone-900">Menu Quick Stats</h2>
                  <button className="text-amber-700 text-xs font-semibold hover:underline flex items-center gap-1">
                    View All Items
                    <TrendingUp size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Peri Peri Maggi', price: 149, category: 'MAGGI', inStock: true },
                    { name: 'Grilled Sourdough', price: 199, category: 'SANDWICH', inStock: true },
                  ].map(item => (
                    <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shrink-0">
                        <ChefHat size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-semibold text-stone-900 leading-snug">{item.name}</p>
                          <span className="text-sm font-bold text-stone-900 ml-1">&#x20B9;{item.price}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={10} className="text-amber-500 fill-amber-500" />
                          <span className="text-xs text-stone-500">Premium Quality</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">{item.category}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={item.inStock} className="sr-only peer" />
                            <div className="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-stone-100 py-6 px-8 flex flex-wrap justify-center gap-6 text-xs text-stone-400">
          <a href="#" className="hover:text-amber-700 transition-colors">About Us</a>
          <a href="#" className="hover:text-amber-700 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-amber-700 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-amber-700 transition-colors">Contact Support</a>
        </div>
        <p className="text-center text-xs text-stone-400 pb-6">
          &copy; 2024 Lo Ji Khao &mdash; Premium Cloud Kitchen. All rights reserved.
        </p>

        {/* FAB */}
        <button className="fixed bottom-6 right-6 w-12 h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-xl flex items-center justify-center transition-colors">
          <Plus size={22} />
        </button>
      </main>
    </div>
  );
}
