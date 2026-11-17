import { NavLink } from 'react-router-dom';
import { useAuth, useLanguage } from '../../hooks/useAuth.js';
import { OFFICER_ROLES, ROLES } from '../../utils/constants.js';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isOfficer = OFFICER_ROLES.includes(user?.role);

  const items = [
    { to: '/', label: t('nav.home'), icon: '💬', show: true },
    { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠', show: true },
    { to: '/diagnosis', label: t('nav.diagnosis'), icon: '🌿', show: true },
    { to: '/planting', label: t('nav.planting'), icon: '🌧️', show: true },
    { to: '/recommendations', label: t('nav.recommendations'), icon: '🌱', show: true },
    { to: '/officer', label: t('nav.officer'), icon: '📊', show: isOfficer },
    { to: '/admin', label: t('nav.admin'), icon: '⚙️', show: user?.role === ROLES.ADMIN },
    { to: '/profile', label: t('nav.profile'), icon: '👤', show: true },
  ].filter((i) => i.show);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white pt-16 transition md:static md:z-0 md:translate-x-0 md:pt-4 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-base ${
                  isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="mt-4 flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-left text-gray-700 hover:bg-gray-100 sm:hidden"
          >
            <span aria-hidden="true">🚪</span>
            {t('nav.logout')}
          </button>
        </nav>
      </aside>
    </>
  );
}
