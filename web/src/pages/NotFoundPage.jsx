import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-5xl font-bold text-brand-700">404</p>
      <p className="text-gray-600">We could not find that page.</p>
      <Link to="/dashboard" className="font-semibold text-brand-700">Go to home</Link>
    </div>
  );
}
