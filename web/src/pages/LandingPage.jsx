import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const FEATURES = [
  { icon: '🌿', title: 'Check your crop', text: 'Send a photo or describe the problem. Get the disease or pest and how to treat it.' },
  { icon: '🌧️', title: 'Can I plant this week?', text: 'Weather-based advice so seed does not rot or dry out.' },
  { icon: '🌱', title: 'What to plant', text: 'Crop and seed suggestions for your soil and area.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <span className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <img src="/logo.svg" alt="" className="h-9 w-9" /> FarmAI
        </span>
        <Link to="/login" className="font-semibold text-brand-700">Log in</Link>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 text-center">
        <h1 className="text-3xl font-extrabold text-brand-900 sm:text-5xl">Farming advice in your pocket</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-700">
          FarmAI helps smallholder farmers find crop diseases, decide when to plant, and choose the right crops.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/register" className="min-h-[48px] rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">Get started</Link>
          <Link to="/login" className="min-h-[48px] rounded-lg border border-brand-600 px-6 py-3 font-semibold text-brand-700">Log in</Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card text-left">
              <p className="text-3xl" aria-hidden="true">{f.icon}</p>
              <h2 className="mt-2 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
