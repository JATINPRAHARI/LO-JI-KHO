import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Trash2, Home, Briefcase, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getAddresses, createAddress, deleteAddress, setDefaultAddress } from '../../services/addresses';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const schema = z.object({
  label: z.enum(['Home', 'Office', 'Other']),
  address_line: z.string().min(10, 'Enter full address'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
  is_default: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const labelIcons: Record<string, React.ReactNode> = {
  Home: <Home size={16} />,
  Office: <Briefcase size={16} />,
  Other: <MapPin size={16} />,
};

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Home', city: 'Mumbai', is_default: false },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed'); },
    onError: () => toast.error('Failed to remove address'),
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Default address updated'); },
  });

  async function onSubmit(data: FormData) {
    try {
      await createAddress(data);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address added!');
      reset();
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to add address.');
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-[#fefce8] dark:bg-stone-950 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl font-bold text-stone-900 dark:text-stone-100">
            Saved Addresses
          </motion.h1>
          <Button leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>Add New</Button>
        </div>

        {isLoading && <p className="text-stone-400 text-center py-10">Loading...</p>}

        {!isLoading && (!addresses || addresses.length === 0) && (
          <EmptyState
            icon={<MapPin size={28} />}
            title="No saved addresses."
            description="Add a delivery address to speed up checkout."
            action={<Button leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>Add Address</Button>}
          />
        )}

        {addresses && addresses.length > 0 && (
          <div className="space-y-4">
            {addresses.map((addr, i) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-sm border ${addr.is_default ? 'border-amber-300 dark:border-amber-700' : 'border-stone-100 dark:border-stone-800'} transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                      {labelIcons[addr.label] ?? <MapPin size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-900 dark:text-stone-100">{addr.label}</p>
                        {addr.is_default && (
                          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">{addr.address_line}</p>
                      {addr.landmark && <p className="text-xs text-stone-400 mt-0.5">Near {addr.landmark}</p>}
                      <p className="text-xs text-stone-400">{addr.city} {addr.pincode && `- ${addr.pincode}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.is_default && (
                      <button onClick={() => defaultMutation.mutate(addr.id)} className="text-stone-400 hover:text-amber-600 transition-colors" title="Set as default">
                        <Star size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteMutation.mutate(addr.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Address" size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Address Type</label>
              <div className="flex gap-2">
                {['Home', 'Office', 'Other'].map(type => (
                  <label key={type} className="flex-1 cursor-pointer">
                    <input type="radio" value={type} {...register('label')} className="sr-only peer" />
                    <div className="peer-checked:bg-amber-600 peer-checked:text-white peer-checked:border-amber-600 border-2 border-stone-200 dark:border-stone-700 rounded-xl py-2 text-center text-sm font-semibold text-stone-600 dark:text-stone-400 transition-all">
                      {type}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <Textarea label="Full Address" placeholder="Building, street, area..." rows={3} error={errors.address_line?.message} {...register('address_line')} />
            <Input label="Landmark (optional)" placeholder="Near XYZ" {...register('landmark')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city')} />
              <Input label="Pincode" placeholder="400050" error={errors.pincode?.message} {...register('pincode')} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_default')} className="rounded border-stone-300" />
              <span className="text-sm text-stone-700 dark:text-stone-300">Set as default address</span>
            </label>
            <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full">Save Address</Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
