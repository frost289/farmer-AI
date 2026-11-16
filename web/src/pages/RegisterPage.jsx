import { Link, Navigate } from 'react-router-dom';
import RegisterForm from '../features/auth/RegisterForm.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function RegisterPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <div className="w-full max-w-sm space-y-4">
        <Link to="/" className="flex items-center justify-center gap-2 text-2xl font-bold text-brand-700">
          <img src="/logo.svg" alt="" className="h-10 w-10" /> FarmAI
        </Link>
        <div className="card">
          <h1 className="mb-4 text-xl font-semibold">Create your account</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
