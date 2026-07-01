import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { resetPassword } from '../../services/auth';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  }

  return (
    <div className="min-h-screen bg-[#fefce8] dark:bg-stone-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-amber-800 rounded-xl flex items-center justify-center text-white font-bold font-playfair">LK</div>
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-stone-900 dark:text-stone-100">Reset Password</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 p-6">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h3 className="font-playfair font-bold text-stone-900 dark:text-stone-100 mb-2">Email sent!</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">Check your inbox for the password reset link.</p>
              <Link to="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 font-semibold hover:underline">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                Send Reset Link
              </Button>
              <Link to="/auth/login" className="flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
