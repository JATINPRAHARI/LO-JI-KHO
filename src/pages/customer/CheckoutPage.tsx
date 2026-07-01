import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, User, Tag, X, Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { validateCoupon } from '../../services/offers';
import { getAddresses } from '../../services/addresses';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { iconForItem } from '../../utils/iconForItem';
import type { Address } from '../../types/database';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^(\+91|0)?[6-9]\d{9}$/, 'Valid phone required'),
  address_line: z.string().min(10, 'Full address required (min 10 chars)'),
  landmark: z.string().optional(),
  delivery_instructions: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedOffer, setAppliedOffer] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!user,
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile?.name ?? '', phone: profile?.phone ?? '' },
  });

  const deliveryFee = 50;
  const total = subtotal + deliveryFee - discount;

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-[#fefce8] dark:bg-stone-950 flex items-center justify-center">
        <EmptyState
          title="Your cart is empty"
          description="Add some items before checking out."
          action={<Button onClick={() => navigate('/menu')}>Browse Menu</Button>}
        />
      </div>
    );
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode, subtotal);
      setDiscount(result.discount);
      setAppliedOffer(result.offer.code);
      toast.success(`Coupon applied! You save ₹${result.discount}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  function handleSelectAddress(addr: Address) {
    setSelectedAddress(addr.id);
    setValue('address_line', addr.address_line);
    setValue('landmark', addr.landmark ?? '');
  }

  async function onSubmit(data: FormData) {
    try {
      // Save order data to sessionStorage for payment page to pick up
      const orderData = {
        user_id: user?.id ?? null,
        subtotal,
        delivery_fee: deliveryFee,
        gst_amount: 0,
        discount_amount: discount,
        total_amount: total,
        offer_code: appliedOffer ?? undefined,
        customer_name: data.name,
        customer_phone: data.phone,
        delivery_address: data.address_line,
        delivery_landmark: data.landmark,
        delivery_instructions: data.delivery_instructions,
        items: items.map(i => ({
          menu_item_id: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
          image_url: i.menuItem.image_url,
          is_veg: i.menuItem.is_veg,
        })),
      };
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
      await clearCart();
      navigate('/payment');
    } catch (err) {
      console.error('Failed to prepare order:', err);
      const message = err instanceof Error ? err.message : 'Failed to proceed. Please try again.';
      toast.error(message);
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-[#fefce8] dark:bg-stone-950 pb-10">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-playfair text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-5">
              {/* Delivery Info */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
                <h2 className="font-playfair font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <User size={18} className="text-amber-600" /> Your Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" leftIcon={<User size={15} />} error={errors.name?.message} {...register('name')} />
                  <Input label="Phone Number" leftIcon={<Phone size={15} />} error={errors.phone?.message} {...register('phone')} />
                </div>
              </div>

              {/* Saved Addresses */}
              {addresses && addresses.length > 0 && (
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
                  <h2 className="font-playfair font-bold text-stone-900 dark:text-stone-100 mb-3 text-sm">Saved Addresses</h2>
                  <div className="flex flex-wrap gap-2">
                    {addresses.map(addr => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${selectedAddress === addr.id ? 'bg-amber-600 text-white border-amber-600' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'}`}
                      >
                        {addr.label} - {addr.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
                <h2 className="font-playfair font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-amber-600" /> Delivery Address
                </h2>
                <div className="space-y-4">
                  <Textarea
                    label="Full Address"
                    placeholder="Flat no., Building name, Street, Area..."
                    rows={3}
                    error={errors.address_line?.message}
                    {...register('address_line')}
                  />
                  <Input label="Landmark (optional)" placeholder="Near XYZ landmark" {...register('landmark')} />
                  <Textarea
                    label="Delivery Instructions (optional)"
                    placeholder="E.g., Leave at door, Call on arrival..."
                    rows={2}
                    {...register('delivery_instructions')}
                  />
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart Items */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
                <h2 className="font-playfair font-bold text-stone-900 dark:text-stone-100 mb-4">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => {
                    const { icon: Icon, gradient } = iconForItem(undefined, item.menuItem.name);
                    return (
                    <div key={item.menuItem.id} className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shrink-0`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">{item.menuItem.name}</p>
                        <p className="text-xs text-stone-400">&#x20B9;{item.menuItem.price}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
                          {item.quantity === 1 ? <Trash2 size={11} className="text-red-500" /> : <Minus size={11} />}
                        </button>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 w-5 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-3 flex items-center gap-2">
                  <Tag size={15} className="text-amber-600" /> Apply Coupon
                </h3>
                {appliedOffer ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
                    <span className="text-sm text-green-700 dark:text-green-400 font-semibold">{appliedOffer} applied &bull; &#x20B9;{discount} off</span>
                    <button type="button" onClick={() => { setAppliedOffer(null); setDiscount(0); setCouponCode(''); }}>
                      <X size={14} className="text-green-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
                    />
                    <Button type="button" variant="outline" size="sm" isLoading={couponLoading} onClick={handleApplyCoupon}>Apply</Button>
                  </div>
                )}
              </div>

              {/* Bill */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>&#x20B9;{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Delivery Fee</span>
                    <span>&#x20B9;{deliveryFee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-&#x20B9;{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-100 dark:border-stone-800 text-base">
                    <span>Grand Total</span>
                    <span>&#x20B9;{total}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                Place Order &amp; Pay &#x20B9;{total}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
