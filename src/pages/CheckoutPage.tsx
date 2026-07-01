import { useState } from 'react';
import { CheckCircle2, Copy, Shield, Phone, CreditCard, Loader2 } from 'lucide-react';
import type { CartItem, Page } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  onNavigate: (page: Page) => void;
  onClearCart: () => void;
}

const orderSteps = [
  { label: 'Order Received', desc: 'We\'ve received your order #LJK-1024', time: '12:45 PM', done: true },
  { label: 'Payment Verified', desc: 'Confirming transaction with your bank...', tag: 'Processing', done: false, active: true },
  { label: 'Kitchen Accepted', desc: 'Our chefs are preparing to cook', done: false },
  { label: 'Preparing', desc: 'Crafting your artisanal comfort food', done: false },
  { label: 'Ready', desc: 'Packed and ready for pickup', done: false },
  { label: 'Out for Delivery', desc: 'Our delivery partner is on the way', done: false },
  { label: 'Delivered', desc: 'Enjoy your Lo Ji Khao experience!', done: false },
];

const stepIcons: Record<string, React.ReactNode> = {
  'Order Received': <CheckCircle2 size={16} />,
  'Payment Verified': <CreditCard size={16} />,
  'Kitchen Accepted': <span>&#x1F373;</span>,
  'Preparing': <span>&#x1F373;</span>,
  'Ready': <span>&#x1F4E6;</span>,
  'Out for Delivery': <span>&#x1F6F5;</span>,
  'Delivered': <span>&#x1F3E0;</span>,
};

export default function CheckoutPage({ cart, onNavigate, onClearCart }: CheckoutPageProps) {
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0) || 458;

  function handleCopy() {
    navigator.clipboard.writeText('lo-ji-khao@upi').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePaid() {
    setPaid(true);
    setTimeout(() => {
      onClearCart();
      onNavigate('profile');
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-[#fefce8]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Payment */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={20} className="text-amber-700" />
              <h2 className="font-playfair text-2xl font-bold text-stone-900">Secure Payment</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              {/* Order info header */}
              <div className="flex items-start justify-between p-5 border-b border-stone-100">
                <div>
                  <p className="text-xs text-stone-400 uppercase font-semibold tracking-wide">Order ID</p>
                  <p className="font-playfair font-bold text-xl text-amber-700 mt-0.5">#LJK-1024</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 uppercase font-semibold tracking-wide">Total Amount</p>
                  <p className="font-playfair font-bold text-xl text-stone-900 mt-0.5">&#x20B9;{total}.00</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* QR Code */}
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 flex items-center justify-center bg-stone-50">
                  <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                      {/* Simple QR-like pattern */}
                      <rect fill="#1c1207" x="10" y="10" width="30" height="30" rx="2"/>
                      <rect fill="white" x="15" y="15" width="20" height="20" rx="1"/>
                      <rect fill="#1c1207" x="20" y="20" width="10" height="10" rx="1"/>
                      <rect fill="#1c1207" x="60" y="10" width="30" height="30" rx="2"/>
                      <rect fill="white" x="65" y="15" width="20" height="20" rx="1"/>
                      <rect fill="#1c1207" x="70" y="20" width="10" height="10" rx="1"/>
                      <rect fill="#1c1207" x="10" y="60" width="30" height="30" rx="2"/>
                      <rect fill="white" x="15" y="65" width="20" height="20" rx="1"/>
                      <rect fill="#1c1207" x="20" y="70" width="10" height="10" rx="1"/>
                      <rect fill="#1c1207" x="45" y="10" width="5" height="5"/>
                      <rect fill="#1c1207" x="45" y="20" width="5" height="5"/>
                      <rect fill="#1c1207" x="52" y="15" width="5" height="5"/>
                      <rect fill="#1c1207" x="45" y="45" width="5" height="5"/>
                      <rect fill="#1c1207" x="55" y="45" width="5" height="5"/>
                      <rect fill="#1c1207" x="65" y="45" width="5" height="5"/>
                      <rect fill="#1c1207" x="75" y="45" width="5" height="5"/>
                      <rect fill="#1c1207" x="85" y="45" width="5" height="5"/>
                      <rect fill="#1c1207" x="45" y="55" width="5" height="5"/>
                      <rect fill="#1c1207" x="60" y="55" width="5" height="5"/>
                      <rect fill="#1c1207" x="75" y="55" width="5" height="5"/>
                      <rect fill="#1c1207" x="45" y="65" width="5" height="5"/>
                      <rect fill="#1c1207" x="55" y="65" width="5" height="5"/>
                      <rect fill="#1c1207" x="70" y="65" width="5" height="5"/>
                      <rect fill="#1c1207" x="85" y="65" width="5" height="5"/>
                      <rect fill="#1c1207" x="45" y="75" width="5" height="5"/>
                      <rect fill="#1c1207" x="60" y="75" width="5" height="5"/>
                      <rect fill="#1c1207" x="80" y="75" width="5" height="5"/>
                      <rect fill="#1c1207" x="45" y="85" width="5" height="5"/>
                      <rect fill="#1c1207" x="55" y="85" width="5" height="5"/>
                      <rect fill="#1c1207" x="65" y="85" width="5" height="5"/>
                      <rect fill="#1c1207" x="85" y="85" width="5" height="5"/>
                    </svg>
                  </div>
                </div>

                <p className="text-center text-sm text-stone-500">Scan to Pay via UPI</p>

                {/* UPI ID */}
                <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-stone-800">lo-ji-khao@upi</span>
                  <button
                    onClick={handleCopy}
                    className="text-stone-400 hover:text-amber-700 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Pay button */}
                <button
                  onClick={handlePaid}
                  disabled={paid}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
                >
                  {paid ? (
                    <><Loader2 size={16} className="animate-spin" /> Confirming payment...</>
                  ) : (
                    <><CheckCircle2 size={16} /> I&apos;ve Paid</>
                  )}
                </button>

                <button
                  onClick={() => onNavigate('menu')}
                  className="w-full text-center text-sm text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Cancel Transaction
                </button>
              </div>

              {/* Secure footer */}
              <div className="mx-5 mb-5 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Secure Transaction</p>
                  <p className="text-xs text-stone-400">Your payment is protected by 256-bit encryption.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Progress */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-stone-900">Order Progress</h2>
              <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Live</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-4">
              <div className="relative">
                {orderSteps.map((step, idx) => (
                  <div key={step.label} className="flex gap-4 relative">
                    {/* Connector line */}
                    {idx < orderSteps.length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-10 ${step.done ? 'bg-amber-500' : 'bg-stone-100'}`} />
                    )}

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 z-10 ${
                      step.done
                        ? 'bg-amber-600 text-white'
                        : step.active
                        ? 'bg-amber-100 border-2 border-amber-500 text-amber-600'
                        : 'bg-stone-100 text-stone-400'
                    }`}>
                      {step.done ? <CheckCircle2 size={15} /> : <span className="text-xs">{idx + 1}</span>}
                    </div>

                    {/* Content */}
                    <div className="pb-10 flex-1">
                      <p className={`font-semibold text-sm ${step.done || step.active ? 'text-stone-900' : 'text-stone-400'}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${step.done || step.active ? 'text-stone-500' : 'text-stone-300'}`}>
                        {step.desc}
                      </p>
                      {step.time && <p className="text-xs text-stone-400 mt-0.5">{step.time}</p>}
                      {step.tag && (
                        <p className="text-xs text-amber-600 font-semibold mt-0.5">{step.tag}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chef card */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 flex items-center gap-4">
              <img
                src="https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Chef Arjun"
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
              <div className="flex-1">
                <p className="font-semibold text-stone-900">Chef Arjun</p>
                <p className="text-xs text-stone-400">Cloud Kitchen Expert</p>
              </div>
              <button className="w-10 h-10 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full flex items-center justify-center transition-colors">
                <Phone size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
