import { Link, Navigate } from 'react-router-dom';
import { Sprout, CloudRain, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const FEATURES = [
  { icon: Sprout, title: 'Check your crop', text: 'Send a photo or describe the problem. Get the disease or pest and how to treat it immediately.', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  { icon: CloudRain, title: 'Can I plant this week?', text: 'Accurate weather-based advice so your seeds do not rot or dry out in the soil.', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  { icon: ShieldCheck, title: 'What to plant', text: 'Expert crop and seed suggestions tailored precisely to your soil type and local region.', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
];

export default function LandingPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between p-6">
        <span className="flex items-center gap-2.5 text-2xl font-black text-emerald-700 dark:text-emerald-500">
          <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-md">
            <Sprout className="h-6 w-6" />
          </div>
          FarmAI
        </span>
        <Link to="/login" className="rounded-xl bg-emerald-50 px-5 py-2.5 font-bold text-emerald-700 transition-all hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-400">Log in</Link>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-6 shadow-sm">
          <Sparkles className="h-4 w-4" /> Smart Farming Made Simple
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Farming advice right in your pocket
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          FarmAI helps smallholder farmers diagnose crop diseases, decide precisely when to plant, and choose the most profitable crops with confidence.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="flex items-center justify-center gap-2 min-h-[52px] rounded-2xl bg-emerald-600 px-8 py-3.5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:scale-105 active:scale-95">
            Get started <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 min-h-[52px] rounded-2xl border-2 border-emerald-600 px-8 py-3.5 text-lg font-bold text-emerald-700 transition-all duration-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-slate-800">
            Log in to account
          </Link>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const IconComp = f.icon;
            return (
              <div key={f.title} className="card text-left p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`mb-4 inline-flex rounded-2xl p-3.5 ${f.color}`}>
                  <IconComp className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{f.title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.text}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
