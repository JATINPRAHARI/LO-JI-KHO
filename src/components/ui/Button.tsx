import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-amber-200/50 hover:shadow-md disabled:bg-amber-300',
  secondary: 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm dark:bg-white dark:text-stone-900',
  outline: 'border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-700 bg-transparent',
  ghost: 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => (
  <motion.button
    ref={ref}
    whileTap={{ scale: 0.97 }}
    disabled={disabled || isLoading}
    className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}
  >
    {isLoading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
    {children}
    {!isLoading && rightIcon}
  </motion.button>
));

Button.displayName = 'Button';
