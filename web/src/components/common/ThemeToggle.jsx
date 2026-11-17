import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-700 hover:bg-stone-200 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {dark ? <Sun className="h-6 w-6" aria-hidden="true" /> : <Moon className="h-6 w-6" aria-hidden="true" />}
    </button>
  );
}
