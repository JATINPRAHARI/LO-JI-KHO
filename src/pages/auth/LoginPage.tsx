import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, UtensilsCrossed, ChefHat, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePageTitle } from '../../hooks/usePageTitle';
import { signIn } from '../../services/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const floatingFood = ['🍕', '🥗', '🍔', '🌮', '🍝', '🥘', '🍛', '🥪'];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg.includes('Invalid') ? 'Invalid email or password' : msg);
    }
  }

  return (
    <div className="min-h-screen bg-[#fefce8] dark:bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative food emojis */}
      {floatingFood.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-3xl opacity-20 dark:opacity-10 pointer-events-none select-none"
          style={{ left: `${10 + (i * 11) % 80}%`, top: `${5 + (i * 17) % 85}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/20 to-transparent dark:from-amber-900/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center text-white font-bold font-playfair text-lg shadow-lg shadow-amber-900/20"
            >
              LK
            </motion.div>
          </Link>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/30"
          >
            <ChefHat size={32} className="text-white" />
          </motion.div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">
            Welcome back, <span className="text-amber-700 dark:text-amber-400">Foodie</span>!
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Sign in to order your favorite comfort food</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800 p-6 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500" />
                <span className="text-xs text-stone-500 dark:text-stone-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg" rightIcon={<ArrowRight size={16} />}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              New to Lo Ji Khao?{' '}
              <Link to="/register" className="text-amber-700 dark:text-amber-400 font-semibold hover:underline inline-flex items-center gap-1">
                Create Account <ArrowRight size={12} />
              </Link>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-stone-900 px-3 text-stone-400">or continue as guest</span>
              </div>
            </div>

            <Link to="/menu">
              <Button type="button" variant="outline" className="w-full" leftIcon={<UtensilsCrossed size={16} />}>
                Browse Menu Without Login
              </Button>
            </Link>
          </div>

          {/* Admin link */}
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Link to="/admin/login" className="flex items-center justify-center gap-2 text-xs text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors group">
              <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-amber-500" />
              Are you an admin? <span className="font-semibold underline">Admin Panel</span>
              <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-amber-500" />
            </Link>
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: Star, label: '5★ Rated' },
            { icon: ChefHat, label: 'Premium Quality' },
            { icon: Lock, label: 'Secure Checkout' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-stone-400">
              <Icon size={12} className="text-amber-500" />
              {label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
