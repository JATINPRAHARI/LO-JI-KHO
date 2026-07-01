interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-600'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4.5' : ''}`}
          style={{ width: '18px', height: '18px', transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </div>
      {label && <span className="text-sm text-stone-700 dark:text-stone-300">{label}</span>}
    </label>
  );
}
