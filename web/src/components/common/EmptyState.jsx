import { Sprout } from 'lucide-react';

export default function EmptyState({ title, message, action, icon: Icon = Sprout }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center dark:border-slate-600">
      <Icon className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <p className="mt-3 text-xl font-bold">{title}</p>
      {message && <p className="muted mt-1">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
