import { Camera, ClipboardCheck, Cpu } from 'lucide-react';

const STEPS = [
  { label: 'Send photo', Icon: Camera },
  { label: 'We check it', Icon: Cpu },
  { label: 'See result', Icon: ClipboardCheck },
];

/** 3-step progress bar. current = 1, 2 or 3. */
export default function DiagnosisSteps({ current = 1 }) {
  return (
    <ol className="flex items-start justify-between" aria-label="Progress">
      {STEPS.map(({ label, Icon }, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-7 h-1.5 w-full -translate-y-1/2 transition-colors duration-500 ${
                  n <= current ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-stone-200 dark:bg-slate-700'
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 transition-colors duration-500 ${
                done || active
                  ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-500 dark:text-slate-950'
                  : 'border-stone-300 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
              } ${active ? 'animate-pulse-soft' : ''}`}
            >
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className={`mt-2 text-base ${active ? 'font-bold text-slate-900 dark:text-white' : 'muted'}`}>
              <span className="sr-only">Step {n}: </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
