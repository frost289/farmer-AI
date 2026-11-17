import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400',
  secondary:
    'border-2 border-stone-300 bg-white text-slate-900 hover:bg-stone-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  danger: 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500',
  ghost: 'text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  icon: Icon,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl px-6 py-3 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
