import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className = '',
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={`w-full appearance-none bg-white dark:bg-stone-900 border ${error ? 'border-red-400' : 'border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-amber-200'} rounded-xl px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 transition-all pr-10 cursor-pointer ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));

Select.displayName = 'Select';
