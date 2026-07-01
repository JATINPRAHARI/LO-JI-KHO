interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && (
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-4 text-amber-600">
          {icon}
        </div>
      )}
      <h3 className="font-playfair font-bold text-xl text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
      {description && (
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
