import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, User, X, Trash2, Plus, Minus, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getAddresses } from '../../services/addresses';
import { getAllSettings } from '../../services/settings';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { iconForItem } from '../../utils/iconForItem';
import type { Address } from '../../types/database';

function getDistanceFromLatLngInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationChecking, setLocationChecking] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getAllSettings,
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile?.name ?? '', phone: profile?.phone ?? '' },
  });

  const deliveryFee = Number(settings?.delivery_fee ?? 40);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    setLocationChecking(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
        setLocationChecking(false);
      },
      err => {
        setLocationError('Unable to verify location. Enable GPS and reload.');
        setLocationChecking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

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

  function handleSelectAddress(addr: Address) {
    setSelectedAddress(addr.id);
    setValue('address_line', addr.address_line);
    setValue('landmark', addr.landmark ?? '');
  }

  async function onSubmit(data: FormData) {
    try {
      // Validate ordering hours
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const withinHours = (mins >= 11 * 60 && mins < 15 * 60) || (mins >= 19 * 60 && mins < 22 * 60);
      if (!withinHours) {
        toast.error('Sorry, ordering is currently unavailable. Please order during our business hours.');
        return;
      }

      // Validate delivery location
      let delivery_distance = 0;
      if (settings?.delivery_lat && settings?.delivery_lng && settings?.delivery_radius_km) {
        if (!userLocation) {
          toast.error('Unable to verify your location. Please enable GPS and reload.');
          return;
        }
        const restaurantLat = Number(settings.delivery_lat);
        const restaurantLng = Number(settings.delivery_lng);
        const maxRadius = Number(settings.delivery_radius_km);
        delivery_distance = Number(getDistanceFromLatLngInKm(restaurantLat, restaurantLng, userLocation.lat, userLocation.lng).toFixed(1));
        if (delivery_distance > maxRadius) {
          toast.error(`Sorry, we only deliver within ${maxRadius} km of our location. Your distance is ${delivery_distance} km.`);
          return;
        }
      }

      // Save order data to sessionStorage for payment page to pick up
      const orderData = {
        user_id: user?.id ?? null,
        subtotal,
        delivery_fee: deliveryFee,
        gst_amount: 0,
        total_amount: total,
        delivery_distance,
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
                  <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-100 dark:border-stone-800 text-base">
                    <span>Grand Total</span>
                    <span>&#x20B9;{total}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Area Status */}
              <div className={`rounded-2xl p-3 text-xs flex items-center gap-2 ${locationError ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : userLocation ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'}`}>
                <Navigation size={14} className="shrink-0" />
                <span>
                  {locationChecking ? 'Detecting your location...' : locationError ? locationError : 'Delivery address is within our service area'}
                </span>
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
