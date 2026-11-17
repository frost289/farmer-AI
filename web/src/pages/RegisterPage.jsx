import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Reveal from '../components/common/Reveal.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import RegisterForm from '../features/auth/RegisterForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function RegisterPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 p-4 dark:bg-slate-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Reveal className="w-full max-w-md space-y-6">
        <Link to="/" className="flex justify-center" aria-label="FarmAI home">
          <Logo size="lg" />
        </Link>
        <div className="card">
          <h1 className="mb-5 text-3xl font-extrabold">Create your account</h1>
          <RegisterForm />
        </div>
      </Reveal>
    </div>
  );
}
