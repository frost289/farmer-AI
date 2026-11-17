import { LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../hooks/useAuth.js';
import Logo from '../common/Logo.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'U';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-stone-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenu}
          className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7" aria-hidden="true" />
        </button>
        <Link to="/dashboard" aria-label="FarmAI home">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Language"
          className="min-h-[48px] rounded-xl border-2 border-stone-300 bg-white px-2 text-base dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="en">English</option>
          <option value="ny">Chichewa</option>
        </select>
        {user && (
          <>
            <button
              onClick={handleLogout}
              className="hidden min-h-[48px] items-center gap-2 rounded-xl px-3 font-semibold text-slate-700 hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:flex"
            >
              <LogOut className="h-6 w-6" aria-hidden="true" />
              {t('nav.logout')}
            </button>
            <Link
              to="/profile"
              aria-label="My profile"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700"
            >
              {initials(user.name)}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
