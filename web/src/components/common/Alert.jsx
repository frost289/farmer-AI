import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

const STYLES = {
  info: { box: 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100', icon: Info },
  success: { box: 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100', icon: CheckCircle2 },
  warning: { box: 'border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100', icon: AlertTriangle },
  error: { box: 'border-red-400 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100', icon: ShieldAlert },
};

export default function Alert({ type = 'info', title, children, className = '' }) {
  if (!children && !title) return null;
  const { box, icon: Icon } = STYLES[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border-2 p-4 text-base ${box} ${className}`}>
      <Icon className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="text-lg font-bold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
