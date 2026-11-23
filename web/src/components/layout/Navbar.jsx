import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-3">
      <div className="flex items-center gap-2">
        <button onClick={onMenu} className="min-h-[44px] min-w-[44px] text-2xl md:hidden" aria-label="Open menu">
          &#9776;
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-brand-700">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          FarmAI
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="language-select">{t('auth.language')}</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label={t('auth.language')}
          className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm"
        >
          <option value="en">English</option>
          <option value="ny">Chichewa</option>
        </select>
        {user && (
          <Button variant="ghost" onClick={handleLogout} className="hidden sm:inline-flex">
            {t('nav.logout')}
          </Button>
        )}
      </div>
    </header>
  );
}
