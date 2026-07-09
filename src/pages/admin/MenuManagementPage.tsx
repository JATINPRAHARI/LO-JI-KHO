import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Star, Flame, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemActive, getAllCategories } from '../../services/menu';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import type { MenuItem } from '../../types/database';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useAuth } from '../../contexts/AuthContext';
import { logAdminAction } from '../../services/audit';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().min(5, 'Description required'),
  price: z.coerce.number().min(1, 'Price must be positive'),
  category_id: z.string().optional(),
  image_url: z.string().url('Valid URL required').or(z.literal('')),
  is_veg: z.boolean(),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
  sort_order: z.coerce.number().default(0),
});
type FormData = z.infer<typeof schema>;

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1645169/pexels-photo-1645169.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5519565/pexels-photo-5519565.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export default function MenuManagementPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: items, isLoading } = useQuery({ queryKey: ['admin-menu'], queryFn: getAllMenuItems });
  const { data: categories } = useQuery({ queryKey: ['all-categories'], queryFn: getAllCategories });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', price: 0, image_url: '', is_veg: true, is_featured: false, is_best_seller: false, sort_order: 0 },
  });

  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Item added');
      closeModal();
    },
    onError: () => toast.error('Failed to add item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMenuItem>[1] }) => updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Item updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Item deleted');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleMenuItemActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Visibility updated');
    },
    onError: () => toast.error('Failed to toggle'),
  });

  function openCreate() {
    setEditingItem(null);
    reset({ name: '', description: '', price: 0, category_id: categories?.[0]?.id ?? '', image_url: SAMPLE_IMAGES[0], is_veg: true, is_featured: false, is_best_seller: false, sort_order: 0 });
    setModalOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      category_id: item.category_id ?? undefined,
      image_url: item.image_url,
      is_veg: item.is_veg,
      is_featured: item.is_featured,
      is_best_seller: item.is_best_seller,
      sort_order: item.sort_order,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
  }

  async function onSubmit(data: FormData) {
    if (editingItem) {
      const updated = await updateMutation.mutateAsync({ id: editingItem.id, data });
      await logAdminAction({
        admin_id: user?.id,
        action: 'update_menu_item',
        entity_type: 'menu_items',
        entity_id: editingItem.id,
        details: { name: data.name },
      });
    } else {
      const created = await createMutation.mutateAsync(data as never);
      await logAdminAction({
        admin_id: user?.id,
        action: 'create_menu_item',
        entity_type: 'menu_items',
        details: { name: data.name },
      });
    }
  }

  const filteredItems = items?.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.categories?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Menu Management</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Add, edit, and manage your menu items.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>Add Item</Button>
      </motion.div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {isLoading && <p className="text-stone-400 text-center py-10">Loading menu...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems?.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden"
          >
            <div className="relative">
              <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {item.is_veg && <Badge variant="success"><Leaf size={10} className="mr-1" />Veg</Badge>}
                {!item.is_veg && <Badge variant="error"><Flame size={10} className="mr-1" />Non-Veg</Badge>}
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {!item.is_active && <Badge variant="warning">Hidden</Badge>}
                {item.is_featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</p>
                  <p className="text-xs text-stone-400">{item.categories?.name ?? 'Uncategorized'}</p>
                </div>
                <p className="font-bold text-amber-600">₹{item.price}</p>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}>
                  {item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(item.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Item' : 'Add New Item'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Item Name" error={errors.name?.message} {...register('name')} />
          <Textarea label="Description" rows={2} error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" step="1" error={errors.price?.message} {...register('price')} />
            <Select label="Category" options={[{ value: '', label: 'None' }, ...(categories?.map(c => ({ value: c.id, label: c.name })) ?? [])]} {...register('category_id')} />
          </div>
          <Input label="Image URL" error={errors.image_url?.message} {...register('image_url')} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_veg')} className="rounded border-stone-300" />
              <span className="text-sm text-stone-700 dark:text-stone-300">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_featured')} className="rounded border-stone-300" />
              <span className="text-sm text-stone-700 dark:text-stone-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_best_seller')} className="rounded border-stone-300" />
              <span className="text-sm text-stone-700 dark:text-stone-300">Best Seller</span>
            </label>
          </div>
          <Input label="Sort Order" type="number" {...register('sort_order')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Item?" size="sm">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">Are you sure you want to delete this item? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
            <Button onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} isLoading={deleteMutation.isPending} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
