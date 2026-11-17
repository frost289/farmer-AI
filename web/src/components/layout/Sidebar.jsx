import { BarChart3, Camera, CloudRain, Home, LayoutDashboard, LogOut, Settings, Sprout, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth, useLanguage } from '../../hooks/useAuth.js';
import { OFFICER_ROLES, ROLES } from '../../utils/constants.js';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isOfficer = OFFICER_ROLES.includes(user?.role);

  const items = [
    { to: '/', label: t('nav.home'), icon: Home, show: true },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, show: true },
    { to: '/diagnosis', label: t('nav.diagnosis'), icon: Camera, show: true },
    { to: '/planting', label: t('nav.planting'), icon: CloudRain, show: true },
    { to: '/recommendations', label: t('nav.recommendations'), icon: Sprout, show: true },
    { to: '/officer', label: t('nav.officer'), icon: BarChart3, show: isOfficer },
    { to: '/admin', label: t('nav.admin'), icon: Settings, show: user?.role === ROLES.ADMIN },
    { to: '/profile', label: t('nav.profile'), icon: User, show: true },
  ].filter((i) => i.show);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-stone-200 bg-white pt-[88px] transition dark:border-slate-700 dark:bg-slate-900 md:static md:z-0 md:translate-x-0 md:pt-4 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-2 px-3" aria-label="Main menu">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-[60px] items-center gap-4 rounded-xl px-4 text-lg ${
                  isActive
                    ? 'bg-emerald-100 font-bold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
                    : 'font-medium text-slate-800 hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-7 w-7 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="mt-4 flex min-h-[60px] items-center gap-4 rounded-xl px-4 text-left text-lg font-medium text-slate-800 hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          >
            <LogOut className="h-7 w-7 shrink-0" aria-hidden="true" />
            {t('nav.logout')}
          </button>
        </nav>
      </aside>
    </>
  );
}
