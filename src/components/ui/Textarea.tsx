import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={`w-full bg-white dark:bg-stone-900 border ${error ? 'border-red-400 focus:ring-red-300' : 'border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-amber-200'} rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 transition-all resize-none ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';
