import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, BarChart3, Server, Activity, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePageTitle } from '../../hooks/usePageTitle';
import { signIn } from '../../services/auth';
import { supabase } from '../../lib/supabase';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const adminFeatures = [
  { icon: BarChart3, label: 'Dashboard Analytics' },
  { icon: Server, label: 'Order Management' },
  { icon: Activity, label: 'Live Kitchen View' },
  { icon: Users, label: 'Menu & Offers' },
];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      await signIn(data.email, data.password);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login failed');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg.includes('Access denied') ? 'Access denied. Admin privileges required.' : msg.includes('Invalid') ? 'Invalid email or password' : msg);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back to site link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Website
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-amber-600/30 ring-2 ring-amber-500/20"
          >
            <ShieldCheck size={34} className="text-white" />
          </motion.div>
          <h1 className="font-playfair text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-stone-500 mt-2 text-sm">Sign in to manage your cloud kitchen</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl blur-xl opacity-20" />
          <div className="relative bg-stone-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-700/50 p-6">
            {/* Role badge */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Super Admin Access</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@lojikhao.in"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                <ShieldCheck size={16} className="mr-1" />
                Sign In as Admin
              </Button>
            </form>

            {/* Features grid */}
            <div className="mt-6 pt-5 border-t border-stone-700/50">
              <p className="text-[10px] text-stone-600 uppercase tracking-wider text-center mb-3">Admin Capabilities</p>
              <div className="grid grid-cols-2 gap-2">
                {adminFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 bg-stone-800/50 rounded-xl border border-stone-700/30">
                    <Icon size={13} className="text-amber-500 shrink-0" />
                    <span className="text-[11px] text-stone-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-700/50">
              <p className="text-center text-sm text-stone-500">
                Not an admin?{' '}
                <Link to="/login" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                  User Login &rarr;
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-3 mt-6"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-stone-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Encrypted Connection
          </div>
          <div className="w-px h-3 bg-stone-700" />
          <div className="flex items-center gap-1.5 text-[10px] text-stone-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Role-based Access
          </div>
          <div className="w-px h-3 bg-stone-700" />
          <div className="flex items-center gap-1.5 text-[10px] text-stone-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Audit Logged
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
