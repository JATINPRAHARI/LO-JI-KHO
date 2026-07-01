import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Tag, Percent, IndianRupee, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getAllOffers, createOffer, updateOffer, deleteOffer } from '../../services/offers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import type { Offer } from '../../types/database';
import { usePageTitle } from '../../../hooks/usePageTitle';

const schema = z.object({
  code: z.string().min(3, 'Code required').max(15, 'Code too long'),
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.coerce.number().min(1, 'Discount required'),
  min_order: z.coerce.number().min(0, 'Minimum must be 0 or more'),
  max_discount: z.coerce.number().optional(),
  valid_until: z.string().optional(),
  is_active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function OffersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: offers, isLoading } = useQuery({ queryKey: ['admin-offers'], queryFn: getAllOffers });

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', title: '', description: '', discount_type: 'percentage', discount_value: 0, min_order: 0, is_active: true },
  });

  const discountType = watch('discount_type');

  const createMutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success('Offer created');
      closeModal();
    },
    onError: () => toast.error('Failed to create offer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateOffer>[1] }) => updateOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success('Offer updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update offer'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success('Offer deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete offer'),
  });

  function openCreate() {
    setEditingOffer(null);
    reset({ code: '', title: '', description: '', discount_type: 'percentage', discount_value: 0, min_order: 0, is_active: true });
    setModalOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditingOffer(offer);
    reset({
      code: offer.code,
      title: offer.title,
      description: offer.description ?? '',
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_order: offer.min_order,
      max_discount: offer.max_discount ?? undefined,
      valid_until: offer.valid_until ?? undefined,
      is_active: offer.is_active,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingOffer(null);
  }

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      code: data.code.toUpperCase(),
      max_discount: data.discount_type === 'percentage' ? data.max_discount : null,
    };
    if (editingOffer) {
      await updateMutation.mutateAsync({ id: editingOffer.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload as never);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Offers & Coupons</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Create and manage promotional offers.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>Create Offer</Button>
      </motion.div>

      {isLoading && <p className="text-stone-400 text-center py-10">Loading offers...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers?.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                    {offer.discount_type === 'percentage' ? <Percent size={18} /> : <IndianRupee size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{offer.code}</p>
                    <p className="text-xs text-stone-400">{offer.title}</p>
                  </div>
                </div>
                {!offer.is_active && <Badge variant="warning">Inactive</Badge>}
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">{offer.description || 'No description'}</p>

              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-stone-500 dark:text-stone-400">Discount</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {offer.discount_type === 'percentage' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-stone-500 dark:text-stone-400">Min Order</span>
                  <span className="text-stone-900 dark:text-stone-100">₹{offer.min_order}</span>
                </div>
                {offer.max_discount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500 dark:text-stone-400">Max Discount</span>
                    <span className="text-stone-900 dark:text-stone-100">₹{offer.max_discount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 mb-4">
                <span className="flex items-center gap-1">
                  <Tag size={12} /> Used {offer.usage_count} times
                </span>
                {offer.valid_until && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(offer.valid_until)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(offer)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(offer.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingOffer ? 'Edit Offer' : 'Create Offer'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coupon Code" error={errors.code?.message} {...register('code')} />
            <Input label="Title" error={errors.title?.message} {...register('title')} />
          </div>
          <Input label="Description (optional)" {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Discount Type" options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'flat', label: 'Flat Amount (₹)' }]} {...register('discount_type')} />
            <Input label="Discount Value" type="number" error={errors.discount_value?.message} {...register('discount_value')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Minimum Order (₹)" type="number" {...register('min_order')} />
            {discountType === 'percentage' && <Input label="Max Discount (₹, optional)" type="number" {...register('max_discount')} />}
          </div>
          <Input label="Valid Until (optional)" type="date" {...register('valid_until')} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="rounded border-stone-300" />
            <span className="text-sm text-stone-700 dark:text-stone-300">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingOffer ? 'Save Changes' : 'Create Offer'}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Offer?" size="sm">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">Are you sure you want to delete this offer?</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
            <Button onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} isLoading={deleteMutation.isPending} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
