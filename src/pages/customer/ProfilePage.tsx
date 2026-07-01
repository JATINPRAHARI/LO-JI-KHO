import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePageTitle } from '../../hooks/usePageTitle';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+91|0)?[6-9]\d{9}$/, 'Enter a valid phone number').or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile?.name ?? '', phone: profile?.phone ?? '' },
  });

  async function onSubmit(data: FormData) {
    if (!user) return;
    try {
      await updateProfile(user.id, data);
      await refreshProfile();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-[#fefce8] dark:bg-stone-950 pb-10">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-playfair text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8">
          My Profile
        </motion.h1>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="w-20 h-20 bg-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold font-playfair shadow-lg">
              {profile?.name?.[0]?.toUpperCase() ?? <User size={32} />}
            </div>
            <div>
              <p className="font-playfair font-bold text-xl text-stone-900 dark:text-stone-100">{profile?.name}</p>
              <p className="text-stone-400 text-sm mt-0.5">{user?.email}</p>
              <span className="inline-block mt-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                {profile?.role ?? 'Customer'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              leftIcon={<User size={15} />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Phone Number"
              type="tel"
              leftIcon={<Phone size={15} />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div className="relative">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"><Mail size={15} /></div>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-500 dark:text-stone-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Email cannot be changed.</p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
                leftIcon={<Save size={15} />}
                size="lg"
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
