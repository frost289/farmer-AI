import { Sprout } from 'lucide-react';

export default function Logo({ size = 'md', showName = true }) {
  const box = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
  const icon = size === 'lg' ? 'h-9 w-9' : 'h-6 w-6';
  return (
    <span className="flex items-center gap-3">
      <span className={`flex ${box} items-center justify-center rounded-xl bg-emerald-600 text-white`}>
        <Sprout className={icon} aria-hidden="true" />
      </span>
      {showName && <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">FarmAI</span>}
    </span>
  );
}
