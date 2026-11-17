import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-4 text-center">
      <Logo size="lg" />
      <p className="text-6xl font-extrabold text-emerald-700 dark:text-emerald-400">404</p>
      <p className="muted text-xl">We could not find that page.</p>
      <Link
        to="/dashboard"
        className="inline-flex min-h-[56px] items-center gap-3 rounded-xl bg-emerald-600 px-6 text-lg font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
      >
        <Home className="h-6 w-6" aria-hidden="true" />
        Go to my dashboard
      </Link>
    </div>
  );
}
