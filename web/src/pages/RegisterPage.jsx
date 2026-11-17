import { Link, Navigate } from 'react-router-dom';
import RegisterForm from '../features/auth/RegisterForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function RegisterPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100/50 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-brand-800 transition-transform hover:scale-[1.02]">
            <img src="/logo.svg" alt="" className="h-11 w-11 drop-shadow-sm" /> FarmAI
          </Link>
          <p className="mt-2 text-sm text-gray-500">Smart farming assistant for your crops and weather</p>
        </div>
        <div className="card shadow-xl shadow-brand-900/5 border border-brand-100/80 backdrop-blur-sm bg-white/90 p-6 sm:p-8 rounded-2xl">
          <h1 className="mb-6 text-xl font-bold tracking-tight text-gray-900">Create your account</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
