/** Accessible bar with a growing animation. value is 0 to 100. */
export default function ProgressBar({ value = 0, label, tone = 'emerald' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color = { emerald: 'bg-emerald-600 dark:bg-emerald-400', amber: 'bg-amber-500', red: 'bg-red-600 dark:bg-red-500' }[tone];
  return (
    <div>
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-slate-700"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`h-full origin-left animate-grow-x rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
